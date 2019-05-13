'use strict'
const express = require('express');
const controller  = require('../controllers/stats');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

// Queries
api.get('/stats/home', md_auth.ensureAuth, controller.getHome);
api.get('/stats/user/:id', md_auth.ensureAuth, controller.getUser);

module.exports = api;
