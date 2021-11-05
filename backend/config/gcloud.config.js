const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    metaDataServerTokenURL: process.env.GCLOUD_META_DATA_SERVER_TOKEN_URL,
    cloudFunctionUrls: {
        getKeywords: process.env.GCLOUD_GET_KEYWORDS_URL,
        getSearchResults: process.env.GCLOUD_GET_SEARCH_RESULTS_URL,
        checkObjectStorage: process.env.GCLOUD_CHECK_OBJECT_STORAGE_URL,
        fetchWebPage: process.env.GCLOUD_FETCH_WEB_PAGE_URL,
        filterWebPage: process.env.GCLOUD_FILTER_WEB_PAGE_URL,
        groupContent: process.env.GCLOUD_GROUP_CONTENT_URL,
        contentToHtml: process.env.GCLOUD_CONTENT_TO_HTML_URL
    }
};
