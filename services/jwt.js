'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'secret_pass';

exports.createToken = function (user) {
    let payload;

    payload = {
        sub: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        password: user.password,
        image: user.image,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(10, 'days').unix()
    }

    return jwt.encode(payload, secret);
}