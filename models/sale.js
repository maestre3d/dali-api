'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SaleSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    costumer: String,
    cart: { type: mongoose.Types.ObjectId, ref: 'Cart', required: true },
    iat: Number,
    payment: String,
    total: Number
});

module.exports = mongoose.model('Sale', SaleSchema);