'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = process.env.JWT_SECRET_KEY;

exports.ensureAuth = function(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(403).send({message: "Authentication required."});
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        let payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()) {
            return res.status(401).send({message: "Session expired."});
        }
        req.user = payload;
    } catch(ex){
        if(ex.message === 'Token expired'){
            return res.status(404).send({message:"Session expired."});
        }else{
            return res.status(404).send({message:"Invalid token."});
        }
    }
    next();

}