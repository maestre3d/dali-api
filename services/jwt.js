'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = process.env.JWT_SECRET_KEY;

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