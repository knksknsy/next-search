const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const WebSearchAPIClient = require('azure-cognitiveservices-websearch');
const request = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();

const receivingFunctionURL = process.env.GCLOUD_CHECK_OBJECT_STORAGE_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};
const WEB_PAGES_COUNT = 10;

/**
 * Get search results from BING Search API.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
async function getSearchResults(req, res) {
	const startTime = Date.now();
	let optionsArray = [];

	const subscription_key = req.body.bingapi;
	let keywords = req.body.keywords;
	let query = req.body.query;
	var timeCollection = req.body.executionTime;

	let credentials = new CognitiveServicesCredentials(subscription_key);
	let webSearchApiClient = new WebSearchAPIClient(credentials);

	let result = await webSearchApiClient.web.search(query);

	if (result == null || result == undefined || result.webPages.value.length === 0) {
		res.status(204).send("No search results. Process terminated.");
	} else {
		const endTime = Date.now();
		timeCollection.push([startTime, endTime, "getSearchResults"]);
	}

	let webPages = result.webPages.value;
	let altCount = WEB_PAGES_COUNT < webPages.length ? WEB_PAGES_COUNT : webPages.length;

	// Prepare request options for each web page.
	// For retrieving web page's filtered result or fetching HTML if web page was not processed yet.
	for (let i = 0; i < webPages.length; i++) {
		if (i < altCount) {
			let webPage = {
				name: webPages[i].name,
				url: webPages[i].url,
				snippet: webPages[i].snippet
			};

			let options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ webPage: webPage, keywords: keywords }),
				url: receivingFunctionURL
			};

			optionsArray.push(options);
		} else {
			break;
		}
	}

	// Either get filtered results or web page's url for later retrival.
	Promise.all(optionsArray.map((option) => {
		// Get token from Google metadata server for calling next cloud function.
		return request(tokenRequestOptions).then((token) => {

			let body = JSON.parse(option.body);
			body.executionTime = timeCollection;

			option.body = JSON.stringify(body);
			option.headers.Authorization = `bearer ${token}`;
			return request(option);
		}).catch((e) => {
			console.error(e.message);
		});

	})).then((responses) => {
		// Prepare response for client.
		// Response contains results array and pendingUrls array.
		// Each element in pendingUrls will later be retrieved from client.
		let pendingUrls = [];
		let results = [];

		responses.forEach((r) => {
			try {
				r = JSON.parse(r);
			} catch (e) {
				console.error(e.message);
			}
			if (r.result != null && r.pendingUrl == null) {
				results.push(r.result);
			}
			if (r.pendingUrl != null && r.result == null) {
				pendingUrls.push(r.pendingUrl);
			}
		});

		let response = { results: results, pendingUrls: pendingUrls };
		res.status(200).send(response);

	}).catch((e) => {
		console.error(e.message);
	});
};

exports.getSearchResults = getSearchResults;
