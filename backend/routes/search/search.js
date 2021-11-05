const express = require('express');
const router = express.Router();
const request = require('request-promise-native');
const { cloudFunctionUrls } = require('../../config/gcloud.config');
const { bingApiKey } = require('../../config/azure.config');

const { JWT } = require('google-auth-library');
const keys = require('../../config/service.account.json');

const jwtClient = new JWT(keys.client_email, null, keys.private_key);

router.get('/', (req, res, next) => {
    res.send('test GET works!');
});

// Route for searching query on <Search Engine>
router.post('/', async (req, res, next) => {
    let query = req.body.query;
    let data = {
        query: query,
        bingapi: bingApiKey
    };

    let idToken = await jwtClient.fetchIdToken(cloudFunctionUrls.getKeywords);
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(data),
        url: cloudFunctionUrls.getKeywords
    }
    console.log(options);
    let response = await request(options);
    res.send(response);
});

module.exports = router;
