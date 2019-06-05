'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TenantSchema = new Schema({
    name: String,
    secret_user: { type: String, default: 'user' },
    secret_admin: { type: String, default: 'root' },
    image: { type: String, default: null }
});

module.exports = mongoose.model('Tenant', TenantSchema);