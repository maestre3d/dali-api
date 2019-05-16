'use strict'
const express = require('express');
const controller = require('../controllers/tenant');
const api = express.Router();

// I/O Reqs
api.post('/tenant', controller.Create);
api.put('/tenant/:id', controller.Update);
api.delete('/tenant/:id', controller.Delete);

// Queries
api.get('/tenant', controller.GetAll);
api.get('/tenant/:id', controller.Get);

module.exports = api;
