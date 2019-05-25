'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    name:           String,
    cost:           Number
});

module.exports = mongoose.model('Service', ServiceSchema);