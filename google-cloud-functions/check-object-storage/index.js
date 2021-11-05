const request = require('request-promise');
const COS = require('ibm-cos-sdk');
const cosConfig = require('./cloud.object.storage.json');
const dotenv = require('dotenv');
dotenv.config();

const BUCKET = process.env.IBM_OBJECT_STORAGE_BUCKET_NAME;
const receivingFunctionURL = process.env.GCLOUD_FETCH_WEB_PAGE_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};

/**
 * Check if web page's result is available in object storage.
 * Send results if available. Otherwise send url for later retrival of results.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
async function checkObjectStorage(req, res) {
	const startTime = Date.now();

	let cosClient = new COS.S3(cosConfig);

	let webPage = req.body.webPage;
	let keywords = req.body.keywords;
	let timeCollection = req.body.executionTime;

	try {
		// Get web page's result
		let data = await cosClient.getObject({ Bucket: BUCKET, Key: webPage.url }).promise();
		if (data != null) {
			res.status(200).send({ result: JSON.parse(Buffer.from(data.Body).toString()), pendingUrl: null });
		} else {
			res.status(200).send(null);
		}
	} catch (e) {
		// Result is yet not persisted. Send web page's url for later retrival.
		res.status(200).send({ result: null, pendingUrl: webPage.url });

		// Get token from Google metadata server for calling next cloud function.
		request(tokenRequestOptions).then((token) => {
			const endTime = Date.now();
			timeCollection.push([startTime, endTime, "checkObjectStorage"]);

			let options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ webPage: webPage, keywords: keywords, executionTime: timeCollection }),
				url: receivingFunctionURL
			};

			request(options).auth(null, null, true, token);
		}).catch((e) => {
			console.error(e.message)
		});
	}
};

exports.checkObjectStorage = checkObjectStorage;
