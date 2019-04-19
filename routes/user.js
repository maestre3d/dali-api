'use strict'

const express = require('express');
const multiParty = require('connect-multiparty');
const api = express.Router();

const controller = require('../controllers/user');
const md_auth = require('../middlewares/authenticated');
const md_upload = multiParty({uploadDir: './uploads/users/', maxFilesSize: 1 * 1024 * 1024});

// CRUD
api.post('/user', controller.newUser);
api.put('/user/:id', md_auth.ensureAuth, controller.updateUser);
api.delete('/user/:id', md_auth.ensureAuth, controller.deleteUser);

// Uploaders to Bucket
api.post('/user/services/files/:id', [md_auth.ensureAuth, md_upload], controller.uploadFile);
api.get('/user/services/files/:imageFile', controller.getImageFile);

// Queries / Misc
api.post('/login', controller.login);
api.get('/user', md_auth.ensureAuth, controller.getUsers);
api.get('/user/:username', md_auth.ensureAuth, controller.getUser);


module.exports = api;

