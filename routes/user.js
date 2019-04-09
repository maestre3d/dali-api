'use strict'

const express = require('express');
const multiParty = require('connect-multiparty');

let api = express.Router();
let controller = require('../controllers/user');
let md_upload = multiParty({uploadDir: './uploads/users/'});

api.post('/user', controller.newUser);
api.post('/login', controller.login);

module.exports = api;

