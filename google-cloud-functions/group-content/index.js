const request = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();

const receivingFunctionURL = process.env.GCLOUD_CONTENT_TO_HTML_URL;
const metadataServerTokenURL = process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL;
const tokenRequestOptions = {
	uri: metadataServerTokenURL + receivingFunctionURL,
	headers: { 'Metadata-Flavor': 'Google' }
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function groupContent(req, res) {
	const startTime = Date.now();

	let content = req.body.content;
	let keywords = req.body.keywords;
	let webPage = req.body.webPage;
	let timeCollection = req.body.executionTime;

	res.status(200).send('groupContent() started');

	let contentGroup = { data: [], matching: 0 };

	// Group semantic text blocks
	content.forEach((cont) => {
		let indices = [];
		let prevEndIndex = 1;

		// Find indices of headings (for separating text blocks)
		cont.forEach((node, index) => {
			if (node.tag && node.tag.toString().search(/\bh[1-6]\b/m) >= 0) {
				indices.push([prevEndIndex, index]);
				prevEndIndex = index;
			}
		});

		let globalWordCount = 0;
		let globalKeywordCount = 0;

		// Remove groups which don't have h[1-6] tag at beginning (garbage groups)
		indices.forEach((index) => {
			if (cont[index[0]].tag.toString().search(/\bh[1-6]\b/m) >= 0) {
				let group = cont.slice(index[0], index[1]);
				// Only add groups with text block size > 1
				if (group.length > 1) {

					let wordCount = 0;
					let keywordmatching = 0;
					group.forEach((node) => {
						wordCount += node.data.split(' ').length;
						if (node.matching && node.matching.length) {
							keywordmatching += node.matching.length;
						}
					});

					// Filter groups with keyword matching < keywords.list
					if (keywordmatching >= keywords.list.length) {
						globalKeywordCount += keywordmatching;
						globalWordCount += wordCount;
						let matching = {
							rate: Math.round((keywordmatching / wordCount) * 100) / 100,
							keywords: keywordmatching,
							words: wordCount
						}
						group.push(matching);
						contentGroup.data.push(group);
						let globalmatching = {
							rate: Math.round((globalKeywordCount / globalWordCount) * 100) / 100,
							keywords: globalKeywordCount,
							words: globalWordCount
						}
						contentGroup.matching = globalmatching;
					}
				}
			}
		});
	});

	// Get token from Google metadata server for calling next cloud function.
	request(tokenRequestOptions).then((token) => {
		const endTime = Date.now();
		timeCollection.push([startTime, endTime, "groupContent"]);

		let data = {
			content: contentGroup,
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

exports.groupContent = groupContent;
