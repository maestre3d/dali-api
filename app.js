'use strict'
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const cors = require('cors');

const API_MD = "/api";

// Routes
const userRoutes = require('./routes/user');
const itemRoutes = require('./routes/item');
const serviceRoutes = require('./routes/service');
const appointRoutes = require('./routes/appoint');
const salesRoutes = require('./routes/sale');
const statsRoutes = require('./routes/stats');
const tenRoutes = require('./routes/tenant');
const supplyRoutes = require('./routes/supply');

const app = express();

// Using gzip
app.use(compression());

// Body Parser config
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Config Morgan logs
let logDir = path.join(__dirname, 'log');
fs.existsSync(logDir) || fs.mkdirSync(logDir);
let accessLogStream = rfs(
    'access.log', {
        interval: '1d',
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
app.use(API_MD, itemRoutes);
app.use(API_MD, serviceRoutes);
app.use(API_MD, appointRoutes);
app.use(API_MD, salesRoutes);
app.use(API_MD, statsRoutes);
app.use(API_MD, tenRoutes);
app.use(API_MD, supplyRoutes);

module.exports = app;