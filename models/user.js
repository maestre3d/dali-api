'use strict'
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = Schema({
    username:       { type: String, dropDups: true },
    name:           String,
    surname:        String,
    password:       String,
    image:          { type: String, default: null },
    role:           { type: String, default: 'ROLE_USER' },
    tenant:         { type: Schema.ObjectId, ref: 'Tenant', default: null }
});

module.exports = mongoose.model('User', UserSchema);