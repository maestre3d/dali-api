'use strict'
const bcrypt = require('bcryptjs');
const Tenant = require('../models/tenant');
const saltRounds = 10;

async function Create(req, res) {
    const params = req.body;
    if ( !params.name || !params.secret_user || !params.secret_admin ) return res.status(400).send({message: 'Fill all fields.'});
    try {
        // Check if not exists
        let find = await Tenant.findOne({name: params.name});
        if (find) return res.status(400).send({message: 'Company is already in use.'});

        // Set tenant object props
        let tenant = new Tenant({
            name: params.name,
            secret_user: params.secret_user,
            secret_admin: params.secret_admin
        });

        // Hash data
        let hash = await bcrypt.hash(tenant.secret_user, saltRounds);
        tenant.secret_user = hash;
        hash = await bcrypt.hash(tenant.secret_admin, saltRounds);
        tenant.secret_admin = hash;

        // Save object to BSON
        tenant.save();
        res.status(200).send({tenant: savedTenant});

    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Update(req, res) {
    const tenantID = req.params.id;
    const payload = req.body;

    try {

        if ( req.user.role !== 'ROLE_ADMIN' && req.user.role !== 'ROLE_ROOT' ) return res.status(403).send({message: "Unauthorized."});

        const tenant = await Tenant.findById(tenantID);
        if ( !tenant ) return res.status(404).send({message: 'Tenant not found.'});
    
        if ( payload.secret_admin ) {
            if ( !payload.oldAdmin ) return res.status(400).send({message: 'You must enter the Dali Admin Secret Key.'});
            const isCorrect = await bcrypt.compare(payload.oldAdmin, tenant.secret_admin);
            if ( isCorrect ) { const hash = await bcrypt.hash(payload.secret_admin, saltRounds); payload.secret_admin = hash; }
            else { return res.status(404).send({message: 'Incorrect password.'}) }
        }
        if ( payload.secret_user ) {
            if ( !payload.oldUser ) return res.status(400).send({message: 'You must enter the Dali User Secret Key.'});
            const isCorrect = await bcrypt.compare(payload.oldUser, tenant.secret_user);
            if ( isCorrect ) { const hash = await bcrypt.hash(payload.secret_user, saltRounds); payload.secret_user = hash; }
            else { return res.status(404).send({message: 'Incorrect password.'}) }
        }
        
        let update = await Tenant.findOneAndUpdate({_id: tenantID}, payload);
        const doSecurity = await Tenant.findByIdAndUpdate(tenantID, { lastModificationUser: req.user.sub, lastModificationDate: ( new Date().getTime() )});
        update ? res.status(200).send({tenant: update}) : res.status(400).send({message : 'Tenant not updated.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Delete(req, res) {
    const tenantID = req.params.id;

    try {
        if ( req.user.role !== 'ROLE_ADMIN' && req.user.role !== 'ROLE_ROOT' ) return res.status(403).send({message: "Unauthorized."});
        let deleted = await Tenant.findOneAndRemove({_id: tenantID});
        deleted ? res.status(200).send({ tenant: deleted}) : res.status(400).send({message: 'Tenant not deleted.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function Get (req, res) {
    const tenantID = req.params.id;
    try {
        const tenant = await Tenant.findById(tenantID).populate({path: 'lastModificationUser'});
        tenant ? res.status(200).send({tenant: tenant}) : res.status(404).send({message: 'Tenant not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function GetAll (req, res) {
    try {
        const tenants = await Tenant.find().limit(100);
        tenants && tenants.length > 0 ? res.status(200).send({tenants: tenants}) : res.status(404).send({message: 'Tenants not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

async function ChangeName(req, res){
    const tenantID = req.params.id;
    const params = req.body;
    try {
        if ( !params.name || !params.new_name ) return res.status(400).send({message: "Fill all the fields."});

        const tenant = await Tenant.findById(tenantID);
        if (!tenant) return res.status(404).send({message: "Tenant not found."});
        if ( params.name !== tenant.name ) return res.status(400).send({message: "Incorrect name."});

        const updatedTenant = await Tenant.findByIdAndUpdate(tenantID, {  name: params.new_name });
        updatedTenant ? res.status(200).send({tenant: updatedTenant}) : res.status(400).send({message: "Failed updating tenant."});

    } catch (error) {
        return res.status(400).send({message: 'Something happened ...'});
    }
}

module.exports = {
    Create,
    Update,
    Delete,
    Get,
    GetAll,
    ChangeName
}