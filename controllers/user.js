'use strict'
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');

let User = require('../models/user');
const API_MSG = "Server Error";
const saltRounds = 10;

function newUser(req, res){
    let params = req.body;
    let user = new User();

    user.name = params.name;
    user.surname = params.surname;
    user.username = params.username;
    user.image = null;
    user.role = 'ROLE_ADMIN';

    if( params.password && params.name && params.surname && params.username ) {
        if(params.secret !== 'caca123' ) {
            res.status(403).send({message:"Incorrect secret pass.\nAsk the admin for it."});
        }else{
            User.findOne({username: params.username}, (err, found)=>{
                if(found){
                    res.status(404).send({message:"User already created."});
                }else{
                    bcrypt.hash(params.password, saltRounds, (err, hash) =>{
                        if(err){
                            res.status(500).send({message:API_MSG});
                        }else{
                            if(!hash){
                                res.status(404).send({message:"Password not hashed."});
                            }else{
                                user.password = hash;
                                user.save((err, userSaved)=>{
                                    if(err){
                                        res.status(500).send({message:API_MSG});
                                    }else{
                                        if(!userSaved){
                                            res.status(404).send({message:"Error creating user."});
                                        }else{
                                            res.status(200).send({user: userSaved});
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    }else{
        res.status(404).send({message:"Fill all the fields."});
    }
}

function login(req, res){
    let params = req.body;
    
    if(params.username && params.password) {
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
        });
    }else{
        res.status(404).send({message:"Fill all the fields."});
    }
}

module.exports = {
    newUser,
    login
};