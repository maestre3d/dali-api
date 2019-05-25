'use strict'
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

let SaleSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    costumer: { type: String, default: null },
    cart: [{ 
        item: {type: Schema.ObjectId, ref: 'Item'},
        quantity: Number
        }],
    iat: Number,
    payment: String,
    total: { type: Number, default: 0 }
});
SaleSchema.plugin(paginate);

module.exports = mongoose.model('Sale', SaleSchema);