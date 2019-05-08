'use strict'
const Sale = require('../models/sale');
const Cart = require('../models/cart');
const Item = require('../models/item');

async function createSale(req, res) {
    const params = req.body;
    // Basic exception Handlers
    if( !params.user || !params.costumer || params.items.length == 0 ) return res.status(400).send({message: "Fill all fields."});
    if( req.user.role !== 'ROLE_ADMIN' && req.user._id !== params.user ) return res.status(403).send({message: "Access denegated."});

    try {
        // Convert client's array into Map & merge IDs into an array so array searching will be enabled
        let tmp_map = new Map();
        // Get item's obj and check non-existing items
        const items = await Item.find({_id: params.items});
        if(items.length !== params.items.length) return res.status(404).send({message: "Item not found."});

        // Calculate total
        let total = 0;
        for(let i =0; i < items.length; i++){
            console.log(items[i].price + " * "+ params.items[i].quantity);
            items[i].price *= params.items[i].quantity;
            total += items[i].price;
        }

        // Init sale obj
        let sale = new Sale({
            user: params.user,
            payment: params.payment,
            costumer: params.costumer,
            iat: new Date(),
            total: total
        });
        let cart = new Cart();
        cart.user = sale.user;

        items.forEach((item) => {
            
            tmp_map.forEach((value, key) => {
                if(key === item._id){
                    item.quantity = value;
                }
            });
            
        });
        return res.status(200).send({sale: sale})
        
        sale.items = tmp_map;
        
        // Check stock availability
        if(checkStock(sale.items, items) === false) return res.status(400).send({message: "Not enough products to sell."});
        // Save data
        let newSale = await sale.save();
        if(!newSale) return res.status(400).send({message: "Couldn't process the operation."});
        // Decrease items stock
        decreaseStock(sale.items, items);
        return res.status(200).send({sale: newSale})

    } catch (err) {
        return res.status(400).send({message: err.message});
    }
}

function checkStock(map, items){
    let isBigger = true;

    map.forEach((value, key) => {
        if(isBigger === true){
            items.forEach(element => {
                if(key === element._id.toString()){
                    if(element.stock >= value){
                        isBigger = true;
                    }else{
                        isBigger = false;
                    }
                }
            });
        }
    });
    return isBigger;
}

function decreaseStock(map, items) {
    items.forEach(item => {
        map.forEach((value, key) => {
            if(item._id.toString() === key){
                console.log(`${item.name} => ${key} - ${value}\n${item.stock - value}`);
                Item.findByIdAndUpdate(item._id, {$inc: {stock: -value}}).exec();
                //, {$inc: {stock: -value}}
            }
        });
    });
}

async function updateSale(req, res) {

}

async function deleteSale(req, res) {

}

async function getSale(req, res) {

}

// POPULATE WITH QUANTITY
async function getSales(req, res) {
    try {
        let tmp = new Map();
        let itemSale = new Map();
        // GraphQL response style - mutated response to sim mongo's populate
        let sales = await Sale.find().limit(100)//.populate({path: 'items', select: 'name', model: Item });
        sales.map((m) => {
            tmp.set(m._id, m.items);
        });

        tmp.forEach((value, key) =>  {
            console.log(key, value);
            //itemSale.set(key, await Item.find(value));
        });

        //sales.forEach(sale => { response.push({ costumer: sale.costumer, iat: sale.iat, total: sale.total, items: items }); });
        sales ? res.status(200).send({sales: sales}):res.status(404).send({message:"Sales not found."});
    } catch (error) {
        return res.status(400).send({message: error.message});
    }
}

async function getUserSales(req, res){

}

module.exports = {
    createSale,
    updateSale,
    deleteSale,
    getSale,
    getSales,
    getUserSales
}