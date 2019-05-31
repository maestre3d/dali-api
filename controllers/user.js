'use strict'
const bcrypt = require('bcryptjs');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2'
});
const bucket = 'dali-api';

const User = require('../models/user');
const Tenant = require('../models/tentant');
const saltRounds = 10;

async function newUser(req, res){
    let params = req.body;

    // Check fields
    if( !params.password || !params.name || !params.surname || !params.username || !params.tenant || !params.secret ) return res.status(404).send({message:"Fill all the fields."});

    let tenant;
    try {
        // Check tenant existance and attach it
        tenant = await Tenant.findById(params.tenant);
        if ( !tenant ) return res.status(404).send({message: 'Tenant not found.'});
        // Verify Dali Secret Keys
        if ( await bcrypt.compare(params.secret, tenant.secret_user) === false && await bcrypt.compare(params.secret, tenant.secret_admin) === false ) return res.status(403).send({message:"Incorrect Dali Secret Key."});
    } catch (error) {
        return res.status(400).send({message: 'Not a valid tenant.'});
    }

    let user;
    if( await bcrypt.compare(params.secret, tenant.secret_user) ) {
        user = new User({
            username: params.username,
            name: params.name,
            surname: params.surname,
            tenant: params.tenant
        });

    }else{
        user = new User({
            username: params.username,
            name: params.name,
            surname: params.surname,
            tenant: params.tenant,
            role: 'ROLE_ADMIN'
        });
    }

    User.find({username: params.username}).exec()
        .then(x => {
            if(x.length >= 1) throw {code : 400, message : "User already exists."};

            return bcrypt.hash(params.password, saltRounds);
        }, (err) => {
            throw {code : 400, message : err};
        })
        .then(hash => {
            user.password = hash;
            return user.save();
        })
        .then(userSaved => {
            if( !userSaved ) throw {code : 400, message : "Couldn't create user."};

            res.status(200).send({user: userSaved});
        })
        .catch(err => {res.status(err.code).send({message:err.message})});
}


function logIn(req, res){
    let params = req.body;
    if(!params.username && !params.password) return res.status(404).send({message:"Fill all the fields."});
    
    let user;
    User.findOne({username: params.username}).exec()
        .then(found => {
            if(!found) throw {code: 404, message: "Incorrect User/Password."}
            user = found;
            return bcrypt.compare(params.password, found.password);
        }, err => { throw {code : 400, message : err} })
        .then(result => {
            if(!result) throw {code: 404, message: "Incorrect User/Password."};

            if( params.getToken === 'true' ) res.status(200).send({token: jwt.createToken(user)});
            else res.status(200).send({user: user});
        })
        .catch(err => res.status(err.code).send({message: err.message}));
}

function getUsers(req, res){
    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"You don't have permission."});

    User.find().limit(50).exec()
        .then((users) => {
            if(!users) throw {code : 404, message : "Couldn't find any users."};

            res.status(200).send({users: users});
        }, err => { throw {code: 400, message: "Something happened..."} })
        .catch((err) => res.status(err.code).send({message:err.message}));
}

function getUser(req, res) {
    let username = req.params.username;
    
    User.findOne({username: username}).populate({path: 'tenant', model: 'Tenant', select: 'name'}).exec()
        .then(user => {
            if(!user) throw {code: 404, message: "User not found."};
            res.status(200).send({user: user});

        }, (err) => { throw {code : 400, message : "User not found."} })
        .catch(err => res.status(err.code).send({message: err.message}));
}

async function updateUser(req, res) {
    let userID = req.params.id;
    let user = req.body;

    if( req.user.role !== 'ROLE_ADMIN' ) return res.status(403).send({message:"You don't have permission."});

    // Hash password if not null
    if( user.password ) {
        const hash = await bcrypt.hash(user.password, saltRounds);
        user.password = hash;
    }

    if ( user.tenant ) {
        const tenant = await Tenant.findById(user.tenant);
        if ( !tenant ) return res.status(404).send({message: 'Tenant not found.'});
    }

    User.findById(userID).exec()
    .then(found => {
        if(!found) throw {code: 404, message: "User not found."};

        // Validate admin's session
        if(found.role === 'ROLE_ADMIN') if(found.id !== req.user.sub) throw {code: 403, message:"Sign in with this admin account to edit it."};

        return User.findByIdAndUpdate(userID, user).exec();
    }, err => { throw {code:400, message:"User not found."} })
    .then(userUpd => {
        if(!userUpd) throw {code: 404, message: "User not found."};

        res.status(200).send({user:userUpd});
    })
    .catch(err => res.status(err.code).send({message:err.message}));
}

function deleteUser(req, res) {
    let userID = req.params.id;

    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"You don't have permission."});

    User.findById(userID).exec()
        .then(found => {
            if(!found) throw {code: 404, message: "User not found."};
            return User.findByIdAndRemove(userID).exec();
        }, err => { throw {code:400, message:"User not found."} })
        .then(user => {
            if(!user) throw {code: 404, message: "Cannot delete user."};
            res.status(200).send({user: user});
        }, err => { throw {code: 400, message:"Something happened..."} })
        .catch(err => res.status(err.code).send({message:err.message}));
        
}

function uploadFile(req, res) {
    let userID = req.params.id;

    if(!req.files) return res.status(400).send({message:"File not detected."});

    let file_path = req.files.image.path;
    let ext_split = path.basename(file_path).split('\.');

    let file_name =  `${ext_split[0]}.${ext_split[1]}`;
    let file_ext = ext_split[1];

    if(file_ext !== 'jpg' && file_ext !== 'jpeg' && file_ext !== 'png' ){
        fs.unlinkSync(file_path);
        return res.status(400).send({message:"File not supported."});
    }

    User.findByIdAndUpdate(userID, {image: file_name}).exec()
        .then(user => {
            if(!user){
                fs.unlinkSync(file_path);
                throw {code: 404, message: "User not found." };
            }

            // Deletes user's older image
            if(user.image) {
                let path_img = `${path.dirname(file_path)}\\${user.image}`;
                if(fs.existsSync(path_img)) fs.unlinkSync(path_img);
            }
            res.status(200).send({user: user});
        }, err => {
            fs.unlinkSync(file_path);
            throw {code:400, message:"Something happened..."}
        })
        .catch(err => res.status(err.code).send({message:err.message}));
    
}

// Using Await - Async from ES7
async function getImageFile(req, res){
    let image_file = req.params.imageFile;
    let path_file = './uploads/users/' + image_file;
    let response = await fs.existsSync(path_file);

    (response.err) ? res.status(404).send({message:"File not found."}) : res.sendFile(path.resolve(path_file));

}

async function uploadS3(req, res) {
    let userID = req.params.id;

    if(!req.files) return res.status(400).send({message:"File not detected."});

    let file_path = req.files.image.path;
    let ext_split = path.basename(file_path).split('\.');

    let file_name =  `${ext_split[0]}.${ext_split[1]}`;
    let file_ext = ext_split[1];

    if(file_ext !== 'jpg' && file_ext !== 'jpeg' && file_ext !== 'png' ){
        fs.unlinkSync(file_path);
        return res.status(400).send({message:"File not supported."});
    }

    try {
        let fileData = fs.readFileSync(file_path);

        const params = {
            Bucket: `${bucket}/users`,
            Key: file_name,
            Body: fileData,
            ACL: 'public-read',
            ContentType: 'image/jpeg'
        };

        let uploadedFile = await s3.upload(params).promise().then(data => data, err => { throw err });
        if(!uploadedFile) return res.status(400).send({message:"S3 Upload failed."});

        let updated = await User.findByIdAndUpdate(userID, {image: uploadedFile.Location});

        if(!updated) {
            fs.unlinkSync(file_path);
            return res.status(404).send({message:"User not found."});
        }else{
            // Removes user's pic from S3 Bucket
            if(updated.image) {
                let aws_path = path.basename(updated.image);
                let pms = {
                    Bucket: `${bucket}/users`,
                    Key: aws_path
                };
                s3.deleteObject(pms, (err, data) =>{
                    if (err) console.log(err, err.stack); // an error occurred
                });
            }
            // Removes locally
            if(fs.existsSync(file_path)) fs.unlinkSync(file_path);
            res.status(200).send({user: updated});
        }
    } catch (err) {
        fs.unlinkSync(file_path);
        return res.status(400).send({message:err.message});
    }
}

module.exports = {
    newUser,
    logIn,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    uploadFile,
    getImageFile,
    uploadS3
};