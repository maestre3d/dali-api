'use strict'
const Appoint = require('../models/appoint');
const User = require('../models/user');
const Service = require('../models/service');
const moment = require('moment');

// Create
async function bookAppoint (req, res) {
    const params = req.body;
    const employeeID = params.employee;
    const costumer = params.costumer;
    const servicesID = params.service;
    const time = params.time;
    // console.log(servicesID);
    console.log(`Employee ID: ${employeeID}\nCostumer:${costumer}`);

    // Verifies identity's role and disallow normal users to create another emplooyee's appointments
    if(req.user.role !== 'ROLE_ADMIN' && req.user.username !== employeeID) return res.status(403).send({message:"Access denegated."});

    if(!employeeID || !costumer || !time || servicesID.length == 0 ) return res.status(400).send({message:"Required data not valid."});

    try {
        let appoint = new Appoint();

        let employee = await User.findOne({username: employeeID});
        if(!employee) return res.status(404).send({message:"User not found."});

        let isOccuped = await Appoint.findOne({$and: [ { user: employee._id }, { time: time } ]});
        if (isOccuped) return res.status(400).send({message: 'Date is already in use.'});

        let services = await Service.find({_id:servicesID});
        if(services.length <= 0) return res.status(404).send({message:"Service not found."});
        
        appoint.time = time;
        appoint.user = employee._id;

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

    try {
        let validate = await Appoint.findById(appointID);
        if(req.user.role !== 'ROLE_ADMIN' && validate.user._id === req.user.sub ) return res.status(403).send({message:"Access denegated."});
        if(!validate) return res.status(404).send({message:"Appointment not found."});
        let updated = await Appoint.findByIdAndUpdate(appointID, appoint);
        updated ? res.status(200).send({appoint: updated}):res.status(404).send({message:"Appointment not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function getActive (req, res) {

    try {
        let found = await Appoint.findOne({$and: [{user: req.user.sub}, {status: 1}]}).populate({ path: 'user', select: 'username' }).populate({ path: 'services', select: 'name' });
        found ? res.status(200).send({appoint: found}):res.status(404).send({message:"Not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}


async function deleteAppoint (req, res) {
    const appointID = req.params.id;

    try {
        let validate = await Appoint.findById(appointID);
        if(req.user.role !== 'ROLE_ADMIN' && validate.user._id === req.user.sub ) return res.status(403).send({message:"Access denegated."});
        if(!validate) return res.status(404).send({message:"Appointment not found."});
        let deleted = await Appoint.findByIdAndRemove(appointID);
        deleted ? res.status(200).send({appoint: deleted}):res.status(404).send({message:"Appointment not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function getAppoints (req, res) {
    try {
        let appoints = await Appoint.find().limit(100).populate({ path: 'user', select: 'name' }).populate({ path: 'services', select: 'name' });
        if(appoints.length <= 0) return res.status(404).send({message:"Appointments not found."});
        res.status(200).send({appoints: appoints});
    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

async function getAppoint (req, res) {
    const appointID = req.params.id;

    try {
        let found = await Appoint.findById(appointID).populate({ path: 'user', select: 'username' }).populate({ path: 'services', select: 'name' });
        found ? res.status(200).send({appoint: found}):res.status(404).send({message:"Not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function activateAppoint (req, res) {
    const appointID = req.params.id;
    const appoint = req.body;

    try {
        let validate = await Appoint.findById(appointID);
        if(!validate) return res.status(404).send({message:"Appointment not found."});
        if(req.user.role !== 'ROLE_ADMIN' && validate.user._id === req.user.sub ) return res.status(403).send({message:"Access denegated."});

        let verify = await Appoint.findOne({$and: [{status: 1}, {user: validate.user}]});
        if(verify) return res.status(400).send({message:"There\'s an active appointment already."});
        
        let updated = await Appoint.findByIdAndUpdate(appointID, appoint);
        updated ? res.status(200).send({appoint: updated}):res.status(404).send({message:"Appointment not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function getUserAp (req, res) {
    const employee = req.query.user;
    try{
        let appoints = await Appoint.find({user: employee}).limit(250).populate({ path: 'services', select: 'name' })
                            .sort({time: -1});
        (appoints.length > 0) ? res.status(200).send({appoints: appoints}):res.status(404).send({message:"Not found."});
    } catch (err) {
        return res.status(400).send({message:"Something happened..."});
    }
}

async function getPendingAp (req, res) {
    const employeeID = req.params.id;
    let init_date = new Date();
    let end_date = new Date();
    init_date.setHours(0, 0, 0, 0);
    end_date.setHours(23, 59, 59, 59);

    try{
        let active =  await Appoint.find({$and: [{status: 0}, {user: employeeID}, {$and: [ {time: {$gte : init_date.getTime()}}, {time: {$lte : end_date.getTime()}} ]}]}).limit(25).populate({path: 'services', select: 'name'})
        .sort({time: +1});

        active.length > 0 ? res.status(200).send({appoints: active}):res.status(404).send({message:"No new appointments."});

    } catch(err) {
        return res.status(400).send({message:err});
    }
}
module.exports = {
    bookAppoint,
    getAppoints,
    updateAppoint,
    deleteAppoint,
    getAppoint,
    getUserAp,
    getPendingAp,
    getActive,
    activateAppoint
}
