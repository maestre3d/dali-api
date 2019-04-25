'use strict'
const Appoint = require('../models/appoint');
const User = require('../models/user');
const Service = require('../models/service');

// Create
async function bookAppoint (req, res) {
    const employeeID = req.query.employee;
    const costumer = req.query.costumer;
    const servicesID = req.query.service;
    // console.log(`Employee ID: ${employeeID}\nCostumer:${costumer}\nServices: ${services[0]}`);

    // Verifies identity's role and disallow normal users to create another emplooyee's appointments
    if(req.user.role !== 'ROLE_ADMIN' && req.user._id !== employeeID) return res.status(403).send({message:"Access denegated."});

    if(!employeeID || !costumer || servicesID.length == 0) return res.status(400).send({message:"Required data not valid."});

    let appoint = new Appoint();

    try {
        let employee = await User.findOne({username: employeeID});
        if(!employee) return res.status(404).send({message:"User not found."});
        let services = await Service.find({_id:servicesID});
        if(services.length <= 0) return res.status(404).send({message:"Service not found."});
        
        appoint.employee = employee._id;
        services.forEach(element => {
            appoint.services.push(element._id);
        });
        appoint.services = services;
        appoint.costumer = costumer;
        let newAppoint = await appoint.save();
        newAppoint ? res.status(200).send({appoint: newAppoint}) : res.status(400).send({message:"Cannot book appointment."});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function updateAppoint (req, res) {
    const appointID = req.params.id;
    const appoint = req.body;



    let updated = await Appoint.findByIdAndUpdate(appointID, appoint);
    updated ? res.status(200).send({appoint: updated}):res.status(400).send({message:"Cannot update appointment."});
}

async function deleteAppoint (req, res) {
    const appointID = req.params.id;

    try {
        let deleted = await Appoint.findByIdAndRemove(appointID);
        deleted ? res.status(200).send({appoint: deleted}):res.status(400).send({message:"Cannot delete appointment."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function getAppoints (req, res) {
    try {
        let appoints = await Appoint.find().limit(100);
        if(appoints.length <= 0) return res.status(404).send({message:"Appointments not found."});
        res.status(200).send({appoints: appoints});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function getAppoint (req, res) {
    const appointID = req.params.id;

    try {
        let found = await Appoint.findById(appointID);
        found ? res.status(200).send({appoint: found}):res.status(404).send({message:"Not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

module.exports = {
    bookAppoint,
    getAppoints,
    updateAppoint,
    deleteAppoint,
    getAppoint
}
