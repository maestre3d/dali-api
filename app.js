'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const cors = require('cors');

const API_MD = "/api";

// Routes
let userRoutes = require('./routes/user');

let app = express();

// Body Parser config
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Config Morgan logs
let logDir = path.join(__dirname, 'log');
fs.existsSync(logDir) || fs.mkdirSync(logDir);
let accessLogStream = rfs(
    'access.log', {
        interval: '4d',
        path: logDir
    }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Http headers
// CORS config
app.use((req, res, next)=> {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-Width, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.header('Allow', 'GET, POST, DELETE, PUT, OPTIONS');

    next();
});

app.options('*', cors());

// Use routes
app.use(API_MD, userRoutes);

module.exports = app;