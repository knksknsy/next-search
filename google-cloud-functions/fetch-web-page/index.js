const request_promise = require('request-promise-native');
const request = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();

const receivingFunctionURL = process.env.GCLOUD_FILTER_WEB_PAGE_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};

/**
 * Fetch HTML of web page.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
async function fetchWebPage(req, res) {
	const startTime = Date.now();

	let webPage = req.body.webPage;
	let keywords = req.body.keywords;
	var timeCollection = req.body.executionTime;

	let option = { method: 'GET', 'rejectUnauthorized': false, url: webPage.url }

	let html = await request_promise(option);

	res.status(200).send(`Fetched HTML of URL: ${webPage.url}.\nFiltering HTML started.`);

	webPage.html = html;

	// Get token from Google metadata server for calling next cloud function.
	request(tokenRequestOptions).then((token) => {
		const endTime = Date.now();
		timeCollection.push([startTime, endTime, "fetchWebPage"]);

		let cloudFunctionOption = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ webPage: webPage, keywords: keywords, executionTime: timeCollection }),
			url: receivingFunctionURL
		};

		request(cloudFunctionOption).auth(null, null, true, token);
	}).catch((e) => {
		console.error(e.message);
	});
};

exports.fetchWebPage = fetchWebPage;
