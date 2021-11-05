const request = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();

const receivingFunctionURL = process.env.GCLOUD_GET_SEARCH_RESULTS_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};

const STOP_WORDS = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];

/**
 * Generate regex from search query.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function getKeywords(req, res) {
	const startTime = Date.now();
	let timeCollection = [];

	let query = req.body.query;

	// Get token from Google metadata server for calling next cloud function.
	request(tokenRequestOptions).then((token) => {
		const endTime = Date.now();
		timeCollection.push([startTime, endTime, "getKeywords"]);

		let kreg = buildRegex(query);

		let data = {
			query: query,
			keywords: {
				list: kreg.keywords,
				regex: kreg.regex
			},
			bingapi: req.body.bingapi,
			executionTime: timeCollection
		};
		let options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `bearer ${token}`
			},
			body: JSON.stringify(data),
			url: receivingFunctionURL
		};

		request(options).then((response) => {
			res.status(200).send(response);
		}).catch((e) => {
			console.error(e.message);
		});

	}).catch((e) => {
		console.error(e.message);
	});
};

/**
 * Build regex from search query.
 * 
 * @param {*} keywords 
 */
function buildRegex(query) {
	// Remove endings of regular verbs
	let keywords = query.toLowerCase().split(' ')
		// Remove duplicate keywords
		.filter((item, i, items) => i === items.indexOf(item))
		// Remove stop words
		.filter(item => STOP_WORDS.indexOf(item) < 0);

	let regexString = '\\b';
	keywords.forEach((keyword, i) => {
		if (i === keywords.length - 1) {
			regexString += `${keyword}\\b`;
		} else {
			regexString += `${keyword}|`;
		}
	});
	return { keywords: keywords, regex: new RegExp(regexString, 'gim') };
};

exports.getKeywords = getKeywords;
