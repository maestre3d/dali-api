'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointSchema = new Schema({
    costumer: { type: String },
    user: { type: Schema.ObjectId, ref:'User', required: true },
    services: [{type: Schema.ObjectId, ref: 'Service'}],
    time: {type: Number},
    status: Number
});

module.exports = mongoose.model('Appoint', AppointSchema);