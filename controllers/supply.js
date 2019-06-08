'use strict'
const Supply = require('../models/supply');

async function Create(req, res) {
    if ( req.user.role !== 'ROLE_ADMIN' ) return res.status(403).send({message: "You don't have permission."});
    const params = req.body;
    if ( !params.name ) return res.status(400).send({message: "Name is required."});
    try {
        const supply = new Supply({
            name: params.name
        });
        if ( params.stock ) { supply.stock = params.stock; }
        if ( params.category ) { supply.category = params.category; }
        const newSupply = await supply.save();
        newSupply ? res.status(200).send({supply: newSupply}) : res.status(400).send({message: "Couldn't create supply."});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function Update(req, res) {
    if ( req.user.role !== 'ROLE_ADMIN' ) return res.status(403).send({message: "You don't have permission."});
    const supplyID = req.params.id;
    const payload = req.body;

    try {
        const supply = await Supply.findById(supplyID);
        if ( !supply ) return res.status(404).send({message: "Supply not found."});
        const updatedSupply = await Supply.findByIdAndUpdate(supplyID, payload);
        updatedSupply ? res.status(200).send({supply: updatedSupply}) : res.status(400).send({message: "Couldn't update supply."});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function Delete(req, res) {
    if ( req.user.role !== 'ROLE_ADMIN' ) return res.status(403).send({message: "You don't have permission."});
    const supplyID = req.params.id;

    try {
        const supply = await Supply.findById(supplyID);
        if ( !supply ) return res.status(404).send({message: "Supply not found."});
        const deletedSupply = await Supply.findByIdAndRemove(supplyID);
        deletedSupply ? res.status(200).send({supply: deletedSupply}) : res.status(400).send({message: "Couldn't delete supply."});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function FindAll(req, res) {
    try {
        const supplies = await Supply.find().limit(100).sort({name: 1});
        supplies.length > 0 ? res.status(200).send({supplies: supplies}) : res.status(404).send({message: "Supplies not found."});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function FindById(req, res) {
    const supplyID = req.params.id;
    try {
        const supply = await Supply.findById(supplyID);
        supply ? res.status(200).send({supply: supply}) : res.status(404).send({message: "Supply not found."});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

module.exports = {
    Create,
    Update,
    Delete,
    FindAll,
    FindById
}