/*
*   GraphQL-like mutated response queries
*   Author: Alonso R
*   Date: 05/13/2019
*   This software is developed for NightLifeX LLC.
*   This code is licensed under GNU Affero General Public License v3 rights, any intent of redistribute without permission will be punished.
*/
'use strict'
// Libs
const moment = require('moment');
// Models
const Sale = require('../models/sale');
const Appoint = require('../models/appoint');

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

module.exports = {
    getHome,
    getUser
}