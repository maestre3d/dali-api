'use strict'
const express = require('express');
const controller = require('../controllers/item');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

api.post('/item', md_auth.ensureAuth, controller.createItem);
api.get('/item', controller.getAll);
api.put('/item/:id', md_auth.ensureAuth, controller.editItem);


module.exports = api;