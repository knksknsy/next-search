const request = require('request-promise');
const COS = require('ibm-cos-sdk');
const cosConfig = require('./cloud.object.storage.json');
const dotenv = require('dotenv');
dotenv.config();

const BUCKET = process.env.IBM_OBJECT_STORAGE_BUCKET_NAME;

/**
 * Parse web page's data structure to HTML output for frontend.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function contentToHtml(req, res) {
	const startTime = Date.now();

	let cosClient = new COS.S3(cosConfig);

	let content = req.body.content;
	let webPage = req.body.webPage;
	let timeCollection = req.body.executionTime;

	res.status(200).send('contentToHtml() started');

	let joinedContent = [];

	// join content back from array snippets to a html content block
	content.data.forEach((content) => {
		let joinedData = { html: undefined, matching: 0 };
		let joinedString = '';
		content.forEach((node, index) => {
			if (index !== content.length - 1 && isNaN(node.tag) && node.tag !== "a") {
				joinedString += `<${node.tag}>${node.data}</${node.tag}>`;
			} else {
				joinedData.matching = node;
			}
		});
		joinedData.html = joinedString;
		joinedContent.push(joinedData);
	});

	content.data = joinedContent;

	const endTime = Date.now();
	timeCollection.push([startTime, endTime, "contentToHTML"]);

	let data = {
		url: webPage.url,
		name: webPage.name,
		snippet: webPage.snippet,
		content: content,
		executionTime: timeCollection
	};

	// write to object storage
	cosClient.putObject({ Bucket: BUCKET, Key: data.url, Body: JSON.stringify(data, null, 4) }).promise()
		.then(() => { })
		.catch((e) => {
			console.error(e);
		});
}

exports.contentToHtml = contentToHtml;
