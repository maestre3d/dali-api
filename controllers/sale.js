'use strict'
const Sale = require('../models/sale');
const Item = require('../models/item');

async function createSale(req, res) {
    const params = req.body;
    // Basic exception Handlers
    if( !params.user || !params.costumer || params.items.length == 0 ) return res.status(400).send({message: "Fill all fields."});
    if( req.user.role !== 'ROLE_ADMIN' && req.user._id !== params.user ) return res.status(403).send({message: "Access denegated."});

    try {
        // Convert client's array into Map & merge IDs into an array so array searching will be enabled
        let item_map = new Map();
        // Get item's obj and check non-existing items
        const items = await Item.find({_id: params.items});
        if(items.length !== params.items.length) return res.status(404).send({message: "Item not found."});

        // Calculate total
        let total = 0;
        for(let i =0; i < items.length; i++){
            params.items.map((value) => {
                if(value._id === items[i]._id.toString()){
                    if(value.quantity > 0) {
                        item_map.set(items[i], value.quantity);
                        items[i].price *= value.quantity;
                        total += items[i].price;
                    }
                }
            });
        }

        // Init sale obj
        let sale = new Sale({
            user: params.user,
            payment: params.payment,
            costumer: params.costumer,
            iat: new Date(),
            total: total
        });

        item_map.forEach((value, key) => {
            sale.cart.push({item: key._id, quantity: value});
        });
        
        // Check stock availability
        if(checkStock(sale.cart, items) === false) return res.status(400).send({message: "Not enough products to sell."});
        // Save data
        let newSale = await sale.save();
        if(!newSale) return res.status(400).send({message: "Couldn't process the operation."});
        // Decrease items stock
        await decreaseStock(sale.cart, items);
        return res.status(200).send({sale: newSale})

    } catch (err) {
        return res.status(400).send({message: err.message});
    }
}

function checkStock(cart, items){
    let isBigger = true;

    // Verify stock
    cart.forEach((product) => {
        if(isBigger === true) {
            items.forEach(item => {
                if (product.item._id === item._id) {
                    item.stock >= product.quantity ? isBigger = true: isBigger = false;
                }
            });
        }
    });
    return isBigger;
}

// Mongo Atomic query for items stock reduction
function decreaseStock(cart, items) { 
    items.map(item => {
        cart.map(product => {
            if(item._id === product.item._id) return Item.findByIdAndUpdate(item._id, {$inc: {stock: -product.quantity}}).exec();
        });
    });
}

async function updateSale(req, res) {
    const saleID = req.params.id;
    const sale = req.body;

    try {
        let updatedSale = await Sale.findByIdAndUpdate(saleID, sale);
        updatedSale ? res.status(200).send({sale: updatedSale}) : res.status(400).send({message:"Couldn't update sale."});
    } catch (err) {
        return res.status(400).send({message: err.message});
    }

}

async function deleteSale(req, res) {
    const saleID = req.params.id;
    if( req.user.role !== 'ROLE_ADMIN' ) return res.status(403).send({message:"Access denegated."});

    try {
        let sale = await Sale.findById(saleID);
        if(!sale) return res.status(404).send({message:"Sale not found."});
        await increaseStock(sale.cart);
        let deleted = await Sale.findByIdAndRemove(sale._id);
        (deleted) ? res.status(200).send({sale: deleted}) : res.status(400).send({message:"Couldn't delete sale."});
    } catch (err) {
        return res.status(400).send({message: err.message});
    }
}

// Mongo atomic query for items stock increase
function increaseStock(cart) { 
    cart.map(product => {
        Item.findByIdAndUpdate(product.item._id, {$inc: {stock: +product.quantity}}).exec();
    });
}

async function getSale(req, res) {
    const saleID = req.params.id;
    try {
        let sale = await Sale.findById(saleID).populate({path:'cart.item'});
        (sale) ? res.status(200).send({sale: sale}):res.status(404).send({message:"Sale not found."});
    } catch (err) {
        return res.status(400).send({message: err.message});
    }
}

async function getSales(req, res) {
    try {
        let sales = await Sale.find().limit(100).populate({path: 'cart.item', select: 'name'});
        ( sales.length > 0 ) ? res.status(200).send({sales: sales}) : res.status(404).send({message:"Sales not found."});
    } catch (err) {
        return res.status(400).send({message: err.message});
    }
}

async function getUserSales(req, res){
    const userID = req.params.id;
    try {
        let sales = await Sale.find({ user: userID }).limit(100).populate({path: 'cart.item', select: 'name'}).sort({'iat': -1});
        ( sales.length > 0 ) ? res.status(200).send({sales: sales}) : res.status(404).send({message:"Sales not found."});

    } catch (err) {
        return res.status(400).send({message:err.message});
    }
}

module.exports = {
    createSale,
    updateSale,
    deleteSale,
    getSale,
    getSales,
    getUserSales
}