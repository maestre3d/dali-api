'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointSchema = new Schema({
    costumer: { type: String },
    user: { type: Schema.ObjectId, ref:'User' },
    services: [{type: Schema.ObjectId, ref: 'Service'}],
    time: {type: Number},
    status: { type: Number, default: 0 },
    total: Number
});

module.exports = mongoose.model('Appoint', AppointSchema);