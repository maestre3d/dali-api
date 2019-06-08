'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplySchema = new Schema({
    name: String,
    category: { type: String, default: null },
    stock: { type: Number, default: 0 },
    lastModificationDate: { type: Number, default: new Date().getTime() }
});

module.exports = mongoose.model('Supply', SupplySchema);