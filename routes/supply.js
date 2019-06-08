'use strict'

const express = require('express');
const api = express.Router();
const controller = require('../controllers/supply');
const md_auth = require('../middlewares/authenticated');

// CRUD
api.post('/supply', md_auth.ensureAuth, controller.Create);
api.put('/supply/:id', md_auth.ensureAuth, controller.Update);
api.delete('/supply/:id', md_auth.ensureAuth, controller.Delete);

// Queries / Misc 
api.get('/supply', md_auth.ensureAuth, controller.FindAll);
api.get('/supply/:id', md_auth.ensureAuth, controller.FindById);

module.exports = api;