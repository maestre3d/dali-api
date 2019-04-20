'use strict'
const Item = require('../models/item');

async function createItem(req, res) {
    let params = req.body;
    
    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});
    if( !params.name && !params.type && !params.brand && !params.stock ) return res.status(400).send({message:"Fill all the required fields."});

    let item = new Item({
        name: params.name,
        brand: params.brand,
        stock: params.stock,
        type: params.type
    });

    const exists = await Item.findOne({name: item.name}).exec()
                            .then(item => item ? true:false, err => { throw {code:400, message: "Something happened..."} })
                            .catch(err => res.status(err.code).send({message:err.message}));
    
    if(exists === true) return res.status(400).send({message:"Item already exists."});

    const itemSaved = await item.save();

    (!itemSaved) ? res.status(404).send({message:"Cannot create item."}) : res.status(200).send({item: itemSaved});
}

async function editItem(req, res) {
    const itemID = req.params.id;
    const item = req.body;

    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});

    const find = await Item.findOne({name: item.name}).exec()
                            .then(found => found ? true:false, err => { throw {code:400, message: "Something happened..."} })
                            .catch(err => res.status(err.code).send({message:err.message}));
    
    if(find) return res.status(400).send({message:"Item already exists."});

    const update = await Item.findByIdAndUpdate(itemID, item).exec()
                            .then(itemUpd => itemUpd, err => { throw {code: 400, message:"Item not found."} })
                            .catch(err => res.status(err.code).send({message:err.message}));
    
    ( !update ) ? res.status(404).send({message:"Item not found."}) : res.status(200).send({item: update});
}

async function deleteItem(req, res) {
    const itemID = req.params.id;

    if (req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});

    const deleted = await Item.findByIdAndRemove(itemID).exec()
                                .then(deleted => deleted, err => { throw {code: 400, message: "Something happened..."} })
                                .catch(err => res.status(err.code).send({message:err.message}));

    (!deleted) ? res.status(404).send({message:"Item not found."}) : res.status(200).send({item: deleted});
}

async function getItems(req, res){
    let items =  await Item.find().exec()
                            .then( items => (items) ? items: null, err => { throw {code:400, message:"Items not found."} })
                            .catch(err => res.status(err.code).send({message:err.message}));

    ( !items ) ? res.status(404).send({message:"Items not found."}) : res.status(200).send({items:items});
}

async function getItem(req, res) {
    const itemID = req.params.id;

    const item = await Item.findById(itemID).exec()
                            .then(item => item, err => { throw {code:400, message:"Something happened..."} })
                            .catch(err => res.status(err.code).send({message:err.message}));

    (!item) ? res.status(404).send({message:"Item not found."}):res.status(200).send({item:item});
}

module.exports = {
    createItem,
    editItem,
    deleteItem,
    getItems,
    getItem
}