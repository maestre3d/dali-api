'use strict'
const bcrypt = require('bcryptjs');
const Tenant = require('../models/tentant');
const saltRounds = 10;

async function Create(req, res) {
    const params = req.body;
    if ( !params.name || !params.secret_user || !params.secret_admin ) return res.status(400).send({message: 'Fill all fields.'});
    try {
        // Check if not exists
        let find = await Tenant.findOne({name: params.name});
        if (find) return res.status(400).send({message: 'Company is already in use.'});

        // Set tenant object props
        let tentant = new Tenant({
            name: params.name,
            secret_user: params.secret_user,
            secret_admin: params.secret_admin
        });

        // Hash data
        let hash = await bcrypt.hash(tentant.secret_user, saltRounds);
        tentant.secret_user = hash;
        hash = await bcrypt.hash(tentant.secret_admin, saltRounds);
        tentant.secret_admin = hash;

        // Save object to BSON
        tentant.save();

        res.status(200).send({tenant: tentant});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Update(req, res) {
    const tID = req.params.id;
    const payload = req.body;

    try {
        let tenant = await Tenant.findById(tID);
        if ( !tenant ) return res.status(404).send({message: 'Tenant not found.'});
    
        if ( payload.secret_admin ) { let hash = await bcrypt.hash(payload.secret_admin, saltRounds); payload.secret_admin = hash; }
        if ( payload.secret_user ) { let hash = await bcrypt.hash(payload.secret_user, saltRounds); payload.secret_user = hash; }
        
        let update = await Tenant.findOneAndUpdate({_id: tID}, payload);
        update ? res.status(200).send({tenant: update}) : res.status(400).send({message : 'Tenant not updated.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Delete(req, res) {
    const tID = req.params.id;

    try {
        let deleted = await Tenant.findOneAndRemove({_id: tID});
        deleted ? res.status(200).send({ tenant: deleted}) : res.status(400).send({message: 'Tenant not deleted.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Get (req, res) {
    const tentantID = req.params.id;
    try {
        const tentant = await Tenant.findById(tentantID);
        tentant ? res.status(200).send({tentant: tentant}) : res.status(404).send({message: 'Tenant not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function GetAll (req, res) {
    try {
        const tentants = await Tenant.find().limit(100);
        tentants && tentants.length > 0 ? res.status(200).send({tentants: tentants}) : res.status(404).send({message: 'Tenants not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

module.exports = {
    Create,
    Update,
    Delete,
    Get,
    GetAll
}