'use strict'
const express = require('express');
const controller = require('../controllers/appoint');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

api.post('/booking', md_auth.ensureAuth, controller.bookAppoint);
api.put('/booking/:id', md_auth.ensureAuth, controller.updateAppoint);
api.delete('/booking/:id', md_auth.ensureAuth, controller.deleteAppoint);

api.get('/booking', controller.getAppoints);
api.get('/booking/:id', controller.getAppoint);
api.get('/user/booking/history/', controller.getUserAp);
api.get('/user/booking/:username', controller.getPendingAp);

module.exports = api;