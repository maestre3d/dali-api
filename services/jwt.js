'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = process.env.JWT_SECRET_KEY;

exports.createToken = function (user) {
    let payload;

    try {
        payload = {
            sub: user.id,
            username: user.username,
            name: user.name,
            surname: user.surname,
            password: user.password,
            image: user.image,
            role: user.role,
            tenant: user.tenant,
            iat: moment().unix(),
            exp: moment().add(10, 'days').unix()
        }
    
        return jwt.encode(payload, secret);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}