const cheerio = require('cheerio');
const request = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();

const receivingFunctionURL = process.env.GCLOUD_GROUP_CONTENT_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};

const SPAN_PARENTS = ['p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'em', 'b', 'small', 'strong', 'big'];

/**
 * Filter relevant content from fetched web page.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function filterWebPage(req, res) {
	const startTime = Date.now();

	let webPage = req.body.webPage;
	let keywords = req.body.keywords;
	let timeCollection = req.body.executionTime;

	res.status(200).send(`groupContent() started.`);

	// Preprocess HTML
	let html = webPage.html;
	const $ = cheerio.load(html);
	$('script').remove();
	$('style').remove();
	$('link').remove();
	$('iframe').remove();
	$('noscript').remove();
	$('svg').remove();
	$('img').remove();
	$('nav').remove();
	$('footer').remove();
	$('aside').remove();
	$('button').remove();
	$('form').remove();
	$('input').remove();
	$('table').remove();
	$('label').remove();
	$('select').remove();
	$('option').remove();

	let content = $('body').children();
	let filteredContent = [];

	// Get relevant divs recursively
	for (let i = 0; i < content.length; i++) {
		let tmpFilteredContent = recursiveDomFilter(keywords.regex, content[i], []);
		if (tmpFilteredContent.length > 1) {
			filteredContent.push(tmpFilteredContent);
		}
	}

	// Get token from Google metadata server for calling next cloud function.
	request(tokenRequestOptions).then((token) => {
		const endTime = Date.now();
		timeCollection.push([startTime, endTime, "filterWebPage"]);

		let data = {
			content: filteredContent,
			keywords: keywords,
			webPage: webPage,
			executionTime: timeCollection
		};

		let options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
			url: receivingFunctionURL
		};

		request(options).auth(null, null, true, token);
	}).catch((e) => {
		console.error(e.message);
	});
};

/**
 * Go through body-tags elements recursively and extract relevant content.
 * 
 * @param {*} regex Keywords to look for.
 * @param {*} node HTML element to look for keywords.
 * @param {*} content Data structure to save filtered content in. Initialized as an empty array.
 */
function recursiveDomFilter(regex, node, content) {
	if (node.children && node.children.length > 0) {
		for (let c = 0; c < node.children.length; c++) {
			recursiveDomFilter(regex, node.children[c], content);
		}
		return content;
	}
	// Only search for elements which contain text.
	if (node.type === 'text' && node.parent.name && node.parent.name.toString().search(/\b(p|h[1-6]|em|b|small|strong|big|span|li|a)\b/m) >= 0) {
		let matching = node.data.match(regex);
		// Only proceed if element contains keywords
		if (matching !== null && matching.length > 0) {
			matching = matching.map(item => item.toLowerCase());

			// Replace tag 'span' with parent's tag for semantics
			if (node.parent.name === 'span' && node.parent.parent.name && SPAN_PARENTS.indexOf(node.parent.parent.name) >= 0) {
				node.parent.name = SPAN_PARENTS.indexOf(node.parent.parent.name);
			}

			content.push({ tag: node.parent.name, data: node.data, matching: { data: matching, length: matching.length } });
			return content;
			// Remove whitespace, new lines and tabs
		} else if (!matching) {
			let data = node.data.replace(new RegExp('(\\t|\\n|\\r| )', 'gm'), '');
			if (data.length > 0) {
				content.push({ tag: node.parent.name, data: node.data });
			}
		}

	}
	return content;
}

exports.filterWebPage = filterWebPage;
