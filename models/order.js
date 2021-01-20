
/**
 * 
 * The following code is required for mongoose library
 * using mongoDB arch
 * 
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        name: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Order', orderSchema);



/**
 * 
 * 
 * Sequelize(SQL Database) based Architecture
 * 
 * 
 */


// const Sequelize = require('sequelize');

// const sequelize = require('../utility/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     }
// });

// module.exports = Order;