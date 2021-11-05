const express = require('express');
const router = express.Router();

const search = require('./search/search');
const results = require('./results/results');

router.get('/', (req, res) => {
    return res.send('api works');
});

// Search route
router.use('/search', search);

// Object Storage route
router.use('/results', results);

module.exports = router;
