'use strict'
const express = require('express');
const controller  = require('../controllers/stats');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

// Queries
api.get('/stats/home', md_auth.ensureAuth, controller.getHome);
api.get('/stats/user/:id', md_auth.ensureAuth, controller.getUser);
api.get('/stats/users', md_auth.ensureAuth, controller.getTotalUsers);
api.get('/stats/services', md_auth.ensureAuth, controller.getTotalServices);
api.get('/stats/supplies', md_auth.ensureAuth, controller.getTotalSupplies);
api.get('/stats/tenant/:id', md_auth.ensureAuth, controller.getTenantLastMod);

module.exports = api;
