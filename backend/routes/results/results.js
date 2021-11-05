const express = require('express');
const router = express.Router();

const resultsCtrl = require('../../controllers/results.ctrl');

// Route to get search results and pending urls
router.post('/', async (req, res, next) => {
    let urls;
    try {
        urls = JSON.parse(req.body.pendingUrls);
    } catch (err) {
        urls = req.body.pendingUrls;
    }
    let results = [];
    let pendingUrls = [];

    for (let i = 0; i < urls.length; i++) {
        let data = await resultsCtrl.getResult(urls[i]);
        if (data != null) {
            if (data.result && !data.pendingUrl) {
                results.push(data.result);
            }
            else if (data.pendingUrl && !data.result) {
                pendingUrls.push(data.pendingUrl);
            }
        }
    }
    let response = { results: results, pendingUrls: pendingUrls };
    res.send(response);
});

module.exports = router;
