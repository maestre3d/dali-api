'use strict'

const Service = require('../models/service');

async function createService (req, res) {
    const params = req.body;

    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});
    if(!params.name) return res.status(400).send({message:"Name is required."});

    const service = new Service({
        name: params.name
    });

    try {
        let found = await Service.findOne({name: service.name});
        if(found) return res.status(400).send({message:"Service already created."});
    
        let newService = await service.save();
        newService ? res.status(200).send({service: newService}) : res.status(404).send({message:"Service cannot be created."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}


async function updateService( req, res ) {
    const service = req.body;
    const serviceID = req.params.id;

    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});

    try {
        let updatedService = await Service.findByIdAndUpdate(serviceID, service);
        updatedService ? res.status(200).send({service: updatedService}):res.status(404).send({message:"Service cannot be updated."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function deleteService(req, res) {
    const serviceID = req.params.id;

    if(req.user.role !== 'ROLE_ADMIN') return res.status(403).send({message:"Access denegated."});
    
    try {
        let deletedService = await Service.findByIdAndRemove(serviceID);
        deletedService ? res.status(200).send({service:deletedService}):res.status(404).send({message:"Service cannot be deleted."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function getServices (req, res) {
    try {
        let services = await Service.find().limit(50);
        services ? res.status(200).send({services: services}) : res.status(404).send({message:"Services not found."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function getService (req, res) {
    const serviceID = req.params.id;

    try {
        let service = await Service.findById(serviceID);
        service ? res.status(200).send({service: service}):res.status(404).send({message:"Service not found."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

module.exports = {
    createService,
    getServices,
    getService,
    updateService,
    deleteService
};
