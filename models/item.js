'use strict'
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

let ItemSchema = Schema({
    name:       String,
    brand:      String,
    type:       String,
    stock:      { type: Number, default: 0 },
    price:      Number
});
ItemSchema.plugin(paginate);

module.exports = mongoose.model('Item', ItemSchema);