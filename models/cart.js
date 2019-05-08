'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CartSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    status: String,
    products: [{type: Schema.ObjectId, ref: 'Item', required: true}]
});

module.exports = mongoose.model('Cart', CartSchema);