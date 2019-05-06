'use strict'
const express = require('express');
const api = express.Router();
const controller = require('../controllers/sale');
const md_auth = require('../middlewares/authenticated');

// CRUD
api.post('/sales', md_auth.ensureAuth, controller.createSale );
api.put('/sales/:id', md_auth.ensureAuth, controller.updateSale);
api.delete('/sales/:id', md_auth.ensureAuth, controller.deleteSale);

// Queries
api.get('/sales/:id', md_auth.ensureAuth, controller.getSale);
api.get('/sales', md_auth.ensureAuth, controller.getSales);
api.get('/sales/user/:id', md_auth.ensureAuth, controller.getUserSales);

module.exports = api;