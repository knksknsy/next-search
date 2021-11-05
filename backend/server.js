'use strict';

// Modul dependencies
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
var compression = require('compression');

// Get our API routes
const api = require('./routes/api');
const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //cache disabled:
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// Set api routes
app.use('/', api);

// Get port from environment and store in Express
const port = process.env.PORT || '3000';
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`API running on host:${port}`);
    console.log(`API running in ${process.env.NODE_ENV} mode.`);
});
