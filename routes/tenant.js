'use strict'
const express = require('express');
const controller = require('../controllers/tenant');
const md_auth = require('../middlewares/authenticated');
const api = express.Router();

// I/O Reqs
api.post('/tenant', controller.Create);
api.put('/tenant/:id', md_auth.ensureAuth, controller.Update);
api.delete('/tenant/:id', md_auth.ensureAuth, controller.Delete);
api.put('/tenant/security/:id', md_auth.ensureAuth, controller.ChangeName);

// Queries
api.get('/tenant', controller.GetAll);
api.get('/tenant/:id', controller.Get);

module.exports = api;
