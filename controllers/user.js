'use strict'
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');

let User = require('../models/user');
const Item = require('../models/item');
const API_MSG = "Server Error";
const saltRounds = 10;

function testPromise(req, res){

    let users;

    User.find().exec()
    .then(found => {
        users = found;
        return Item.find().exec();
    })
    .then(items => {
        if(!users && !items){
            res.status(404).send({message:"Not found."});
        }else{
            res.status(200).send({user: users, item: items});
        }
    })
    .catch(err => res.status(500).send({message:err}));

    /*Promise.all([
        User.find(),
        Item.find()
    ])
    .then(([users, items]) => {
        if(!users && !items){
            res.status(404).send({message:"Not found."});
        }else{
            res.status(200).send({user: users, item: items});
        }
    })
    .catch(err => res.status(500).send({message:err}));*/
}

function newUser(req, res){
    let params = req.body;

    if( params.password && params.name && params.surname && params.username && params.secret ) {
        if(params.secret !== 'caca123' ) {
            return res.status(403).send({message:"Incorrect secret pass.\nAsk the admin for it."});
        }
        let user = new User({
            username: params.username,
            name: params.name,
            surname: params.surname
        });

        User.find({username: params.username}).exec()
        .then(x => {
            if(x.length >= 1) throw {code : 404, message : "User already exists."};

            return bcrypt.hash(params.password, saltRounds);
        }, (err) => {
            throw {code : 500, message : err};
        })
        .then(hash => {
            user.password = hash;
            return user.save();
        })
        .then(userSaved => {
            if( !userSaved ) throw {code : 400, message : "Couldn't create user."};

            res.status(200).send({user: userSaved});
        })
        .catch(err => {
            res.status(err.code).send({message:err.message})
        });
    }else{
        res.status(404).send({message:"Fill all the fields."});
    }
}


function login(req, res){
    let params = req.body;
    
    if(params.username && params.password) {
        /*
        let logPromise = new Promise((resolve, reject) => {
            User.findOne({username: params.username}, (err, found)=>{
                if(err){
                    reject(err);
                }else{
                    if(!found){
                        res.status(404).send({message:"Incorrect User/Password."});
                    }else{
                        bcrypt.compare(params.password, found.password).then(result=>{
                            if(result === false){
                                res.status(404).send({message:"Incorrect User/Password."});
                            }else{
                                resolve(found);
                            }
                        });
                    }
                }
            });
        });
        logPromise.catch((err)=> res.status(500).send({message:API_MSG}) );
        logPromise.then((user) => {
            if( params.getToken === 'true' ){
                res.status(200).send({token: jwt.createToken(user)});
            }else{
                res.status(200).send({user: user});
            }
        });*/

        let user;
        User.findOne({username: params.username}).exec()
        .then(found => {
            if(!found) throw {code: 404, message: "Incorrect User/Password."}

            user = found;
            return bcrypt.compare(params.password, found.password);
        }, err => { throw {code : 500, message : err} })
        .then(result => {
            if(!result) throw {code: 404, message: "Incorrect User/Password."};

            if( params.getToken === 'true' ) res.status(200).send({token: jwt.createToken(user)});
            else res.status(200).send({user: user});
        })
        .catch(err => res.status(err.code).send({message: err.message}));
    }else{
        res.status(404).send({message:"Fill all the fields."});
    }
}

function getUsers(req, res){
    let find = User.find().exec();

    find.then((users) => {
        if(!users){
            throw {code : 404, message : "Couldn't find any users."};
        }

        res.status(200).send({users: users});
    })
    .catch((err) => res.status(err.code).send({message:err.message}));
}

module.exports = {
    newUser,
    login,
    getUsers,
    testPromise
};