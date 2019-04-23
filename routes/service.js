'use strict'
const express = require('express');
const md_auth = require('../middlewares/authenticated');
const controller = require('../controllers/service');
let api = express.Router();

// CRUD
api.post('/service', md_auth.ensureAuth, controller.createService);
api.put('/service/:id', md_auth.ensureAuth, controller.updateService);
api.delete('/service/:id', md_auth.ensureAuth, controller.deleteService);

//Queries / Misc
api.get('/service', controller.getServices);
api.get('/service/:id', controller.getService);

module.exports = api;