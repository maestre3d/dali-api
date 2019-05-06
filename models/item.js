'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ItemSchema = Schema({
    name:       String,
    brand:      String,
    type:       String,
    stock:      Number,
    price:      Number
});

module.exports = mongoose.model('Item', ItemSchema);