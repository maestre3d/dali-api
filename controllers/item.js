'use strict'
// Model(s)
const Item = require('../models/item');

// Misc
const API_MSG = 'Server Error';

function createItem(req, res) {
    let params = req.body;
    let item = new Item();

    if(req.user.role !== 'ROLE_ADMIN'){
        res.status(403).send({message:"Access denegated."});
    }

    if ( params.name && params.type && params.brand && params.stock ) {
        item.name = params.name;
        item.brand = params.brand;
        item.stock = params.stock;
        item.type = params.type;

        let find = Item.findOne({name: params.name}).exec();

        find
        .then((found) => {
            if(found){
                res.status(404).send({message:"Product already exists."});
            }else{
                return item.save();
            }
        })
        .then((itemSaved) => {
            if(!itemSaved){
                res.status(404).send({message:"Cannot create product."});
            }else{
                res.status(200).send({item: itemSaved});
            }
        })
        .catch((err) => res.status(500).send({message:API_MSG}));

    }else{
        res.status(404).send({message:"Fill all the fields."});
    }
}

function editItem(req, res) {
    const itemId = req.params.id;

    if(req.user.role !== 'ROLE_ADMIN'){
        console.log(req.user);
        
        res.status(403).send({message:"Access denegated."});
    }

    let findItem = new Promise((resolve, reject)=>{
        Item.findById(itemId, (err, found)=>{
            if(err){
                reject(err);
            }else{
                resolve(found);
            }
        });     
    });

    let checkRepeat = new Promise((resolve, reject) => {
        let item = req.body;
        Item.findOne({name: item.name}, (err, exists) => {
            if(err){
                reject(err);
            }else{
                if(exists){
                    res.status(404).send({message:"Product already exists."});
                }else{
                    resolve(exists);
                }
            }
        });
    });

    findItem.catch((err) => res.status(500).send({message:API_MSG}));
    findItem.then((found) => {
        checkRepeat.catch((err) => res.status(500).send({message:API_MSG}));
        checkRepeat.then((exists) => {
            if(!exists){
                let updateItem = new Promise((resolve, reject) => {
                    Item.findByIdAndUpdate(found._id, (err, itemUpd) => {
                        if(err){
                            reject(err);
                        }else{
                            if(!itemUpd){
                                res.status(404).send({message:"Cannot update product."});
                            }else{
                                resolve(itemUpd);
                            }
                        }
                    });
                });

                updateItem.catch((err) => res.status(500).send({message:API_MSG}));
                updateItem.then((itemUpd) => res.status(200).send({item: itemUpd}));
            }
        });
    });
}

function getAll(req, res){
    Item.find().exec()
    .then((items) => {
        if(!items){
            res.status(404).send({message:"Couldn't find any products."});
        }else{
            res.status(200).send({items: items})
        }
    })
    .catch((err) => res.status(500).send({message:API_MSG}))
}

module.exports = {
    createItem,
    editItem,
    getAll
}