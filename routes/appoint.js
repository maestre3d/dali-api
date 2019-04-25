'use strict'
const express = require('express');
const controller = require('../controllers/appoint');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

api.post('/booking', controller.bookAppoint);
api.put('/booking/:id', controller.updateAppoint);
api.delete('/booking/:id', controller.deleteAppoint);

api.get('/booking', controller.getAppoints);
api.get('/booking/:id', controller.getAppoint);

module.exports = api;