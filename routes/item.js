'use strict'
const express = require('express');
const controller = require('../controllers/item');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

// CRUD
api.post('/item', md_auth.ensureAuth, controller.createItem);
api.put('/item/:id', md_auth.ensureAuth, controller.editItem);
api.delete('/item/:id', md_auth.ensureAuth, controller.deleteItem);

// Queries / Misc
api.get('/item', controller.getItems);
api.get('/item/:id', controller.getItem);


module.exports = api;