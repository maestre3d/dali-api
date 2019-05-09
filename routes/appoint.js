'use strict'
const express = require('express');
const controller = require('../controllers/appoint');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

// CRUD
api.post('/booking', md_auth.ensureAuth, controller.bookAppoint);
api.put('/booking/:id', md_auth.ensureAuth, controller.updateAppoint);
api.delete('/booking/:id', md_auth.ensureAuth, controller.deleteAppoint);

// Queries
api.get('/booking', controller.getAppoints);
api.get('/booking/:id', controller.getAppoint);
api.get('/user/booking/history/', md_auth.ensureAuth, controller.getUserAp);
api.get('/user/booking/:id', md_auth.ensureAuth, controller.getPendingAp);
api.get('/user/book/active', md_auth.ensureAuth, controller.getActive);
api.put('/user/book/activate/:id', md_auth.ensureAuth, controller.activateAppoint);

module.exports = api;