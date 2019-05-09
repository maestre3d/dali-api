'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SaleSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    costumer: String,
    cart: [{ 
        item: {type: mongoose.Types.ObjectId, ref: 'Item', required: true},
        quantity: Number
        }],
    iat: Number,
    payment: String,
    total: { type: Number, default: 0 }
});

module.exports = mongoose.model('Sale', SaleSchema);