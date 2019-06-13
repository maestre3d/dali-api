/*
*   GraphQL-like mutated response queries
*   Author: Alonso R
*   Date: 05/13/2019
*   This software is developed for NightLifeX LLC.
*   This code is licensed under GNU Affero General Public License v3 rights, any intent of redistribute without permission will be punished.
*/
'use strict'
// Libs

// Models
const Sale = require('../models/sale');
const Appoint = require('../models/appoint');
const User = require('../models/user');
const Service = require('../models/service');
const Tenant = require('../models/tenant');
const Supply = require('../models/supply');

async function getHome(req, res) {
    const userID = req.user.sub;
    try {
        // Get current month
        let tmp_date = new Date();
        tmp_date = tmp_date.getMonth();

        // Set current month & convert it into Epoch UNIX time
        let current_month = new Date();
        current_month.setDate(1);
        current_month.setHours(0,0,0,0);
        current_month.setMonth(tmp_date);

        // Set past month and convert it into Epoch UNIX time
        let past_month = new Date();
        past_month.setDate(1);
        past_month.setHours(0,0,0,0);
        if ( (tmp_date - 1) < 0 ) { 
            past_month.setMonth(0);
        }else{
            past_month.setMonth(tmp_date - 1);
        }
        
        // Mutated response
        let mutated_res;

        // Mongo queries
        //  *   Get current month's sales & dates
        let month_sales = await Sale.find({$and: [{user: userID}, {iat: {$gte: current_month }} ]}).countDocuments();
        let month_appoints = await Appoint.find({$and: [ {user: userID}, {time: {$gte: current_month} } ]}).countDocuments();
        
        //  *   Get past month's sales & dates
        let past_sales = await Sale.find({$and: [{user: userID}, {iat: {$gte: past_month, $lt: current_month} }]}).countDocuments();
        let past_appoints = await Appoint.find({$and: [ {user: userID}, {time: {$gte: past_month, $lt: current_month} } ]}).countDocuments();

        // Set mutation
        mutated_res = {
            sales: { month: month_sales, past: past_sales},
            appoints: { month: month_appoints, past: past_appoints }
        };

        res.status(200).send({stats: mutated_res});
    } catch (error) {
        return res.status(400).send({message: "Something went wrong..."});
    }
}

async function getUser(req, res) {
    let userID = req.params.id;
    try {
        // Get current year
        let tmp_date = new Date();
        tmp_date = tmp_date.getFullYear();

        // Set current year & convert it into Epoch UNIX time
        let current_year = new Date();
        current_year.setDate(1);
        current_year.setHours(0,0,0,0);
        current_year.setMonth(0);
        current_year.setFullYear(tmp_date);

        // Set past year and convert it into Epoch UNIX time
        let past_year = new Date();
        past_year.setDate(1);
        past_year.setHours(0,0,0,0);
        past_year.setMonth(0);
        if ( (tmp_date - 1) < 0 ) { 
            past_year.setFullYear(0);
        }else{
            past_year.setFullYear(tmp_date - 1);
        }

        // Mutated response
        let mutated_res;

        // Mongo queries
        //  *   Get current year's sales & dates
        let year_sales = await Sale.find({$and: [{user: userID}, {iat: {$gte: current_year} }]});
        let year_appoints = await Appoint.find({$and: [ {user: userID}, {time: {$gte: current_year} } ]});
        let total_current = year_sales.length + year_appoints.length;

        //  *   Get past years's sales & dates
        let past_sales = await Sale.find({$and: [{user: userID}, {iat: {$gte: past_year, $lt: current_year} }]}).countDocuments();
        let past_appoints = await Appoint.find({$and: [ {user: userID}, {time: {$gte: past_year, $lt: current_year} } ]}).countDocuments();
        let total_past = past_sales + past_appoints;

        mutated_res = {
            year: {
                current: total_current,
                last: total_past
            },
            sales: {
                month: {}
            },
            services: {
                month: {}
            }
        };

        //  *   Get by month
        // Set months array
        let months_sales = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
        let months_services = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
        // Save data by K-V (item.ID - month)
        let monthly_sales = new Map();
        let monthly_services = new Map();

        // Date getter
        let tmp = new Date();

        // Iterate to fill maps
        for(let i = 0; i < year_sales.length; i++){
            // Get sale time
            tmp.setTime(year_sales[i].iat);
            monthly_sales.set(year_sales[i]._id, tmp.getMonth());
        }
        for(let i = 0; i < year_appoints.length; i++){
            // Get service time
            tmp.setTime(year_appoints[i].time);
            monthly_services.set(year_appoints[i]._id, tmp.getMonth());
        }

        // Fill month arrays
        monthly_sales.forEach((value) => {
            for(let i = 0; i < 12; i++){
                if(value === i){ months_sales[i]++; }
            }
        });
        monthly_services.forEach((value) => {
            for(let i = 0; i < 12; i++){
                if(value === i){ months_services[i]++; }
            }
        });

        // Set arrays to mutated response
        mutated_res.sales.month = months_sales;
        mutated_res.services.month = months_services;
        
        res.status(200).send({stats: mutated_res});

    } catch (error) {
        return res.status(400).send({message:"Something went wrong..."});
    }
}

async function getTotalUsers(req, res) {
    try {
        const users = await User.find({role: 'ROLE_USER'}).countDocuments();
        const admins = await User.find({role: 'ROLE_ADMIN'}).countDocuments();
        users && admins ? res.status(200).send({users: users, admins: admins}) : res.status(404).send({message: 'Users not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function getTotalServices(req, res) {
    try {
        // TODO: Return the most used service
        const appoints = await Appoint.find().distinct('services');

        const services = await Service.find().countDocuments();
        services ? res.status(200).send({services: services}) : res.status(404).send({message: 'Services not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...  ' + error.message});
    }
}

async function getTotalSupplies(req, res) {
    try {
        const supplies = await Supply.find().sort({category: 1});
        let typeSupplies = new Map();
        let supplyArray = [];
        let oldCategory = null;
        supplies.forEach(supply => {
            if ( !oldCategory || supply.category == oldCategory ) {
                let oldValue = typeSupplies.get(supply.category);
                oldValue ? typeSupplies.set(supply.category, oldValue + 1) : typeSupplies.set(supply.category, 1);
            } else{
                typeSupplies.set(supply.category, 1);
            }
            oldCategory = supply.category;
        });
        typeSupplies.forEach((value, key) => {
            supplyArray.push({ type: key, total: value });
        });

        supplies && supplies.length > 0 ? res.status(200).send({supplies: supplyArray, total: supplies.length}) : res.status(404).send({message: 'Supplies not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function getTenantLastMod(req, res) {
    const tenantID = req.params.id;
    try {
        const tenant = await Tenant.findById(tenantID).populate({path: 'lastModificationUser'});
        tenant ? res.status(200).send({lastModificationDate: tenant.lastModificationDate, lastModificationUser: tenant.lastModificationUser}) : res.status(404).send({message: 'Tenant not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened...'});
    }
}

async function getTopService(req, res) {
    try {
        const pipeline = [
        {
            "$group": {
                "_id": "$services",
                "count": {
                    "$sum": 1
                }
            }
        }];
        const dates = await Appoint.aggregate(pipeline);
        dates ? res.status(200).send({stats: dates}) : res.status(404).send({message: 'Appoints not found.'});
    } catch (error) {
        return res.status(400).send({message: 'Something happened... ' + error.message});
    }
}

async function getGeneralSales(req, res) {
 try {
    // TODO: Get all incomings from sales & completed appoints by month
 } catch (error) {
    return res.status(400).send({message: 'Something happened...'});
 }
}

module.exports = {
    getHome,
    getUser,
    getTotalUsers,
    getTotalServices,
    getTotalSupplies,
    getTenantLastMod,
    getTopService
}