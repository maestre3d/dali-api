'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SaleSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    costumer: String,
    items: { type: Map, of: String },
    // cart: { type: Schema.ObjectId, ref: 'Cart', required: true },
    // items: [{ type: Schema.ObjectId, ref: 'Item', required: true }],
    iat: Number,
    total: Number
});

module.exports = mongoose.model('Sale', SaleSchema);