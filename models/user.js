'use strict'
const mongoose  = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = Schema({
    username: String,
    name: String,
    surname: String,
    password: String,
    image: String,
    role: String
});

module.exports = mongoose.model('User', UserSchema);