
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        // product already exists
        newQuantity = this.cart.items[cartProductIndex]
            .quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        // Newly Added.
        updatedCartItems.push({
            productId: product._id, 
            quantity: newQuantity
        });
    }

    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteCartProduct = function(productId) {
    const updatedCartItems = this.cart.items.filter(product => {
        return product.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', userSchema);


// const TAG = "User_Model";

// /**
//  * 
//  * 
//  * MongoDB based design
//  * 
//  * 
//  */
// const mongoDB = require('mongodb');

// const getDb = require('../utility/database').getDb;
// const Product = require('./product');

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;   // {items: []}
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {

//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             // product already exists
//             newQuantity = this.cart.items[cartProductIndex]
//                 .quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             // Newly Added.
//             updatedCartItems.push({
//                 productId: new mongoDB.ObjectID(product._id), 
//                 quantity: newQuantity
//             });
//         }

//         const updatedCart = {items: updatedCartItems};

//         const db = getDb();
//         return db.collection('users').updateOne({
//             _id: new mongoDB.ObjectID(this._id)
//         }, {
//             $set: {
//                 // Just update the cart field
//                 cart: updatedCart
//             }
//         });
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         });
//         //productIds.forEach(id => console.log("Id: " + id));
//         return db.collection('products').find({
//             _id: {
//                 $in: productIds
//             }
//         }).toArray()
//         .then(products => {
//             return products.map(product => {                
//                 return {
//                     ...product,
//                     quantity: this.cart.items.find(item => {
//                         return item.productId.toString() ===
//                             product._id.toString();
//                     }).quantity
//                 }
//             });
//         })
//         .catch(err => console.log(TAG, "getCart", err));
//     }

//     deleteCartProduct(prodId) {
//         if (!prodId) {
//             console.log(TAG, "deleteCartProduct", 
//                 "ProdId param is null");
//             return;
//         }
//         const db = getDb();
//         const productIndex = this.cart.items.findIndex(item => {
//             return item.productId.toString() === 
//                 prodId.toString();
//         });
//         const updatedItems = [...this.cart.items];
//         updatedItems.splice(productIndex, 1);
//         return db.collection('users').updateOne({
//             _id: mongoDB.ObjectID(this._id)
//         }, {
//             $set: {
//                 cart: {
//                     items: updatedItems
//                 }
//             }
//         })
//     }

//     addOrder() {
//         const db = getDb();

//         return this.getCart()
//         .then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: mongoDB.ObjectID(this._id),
//                     name: this.name
//                 },
//                 totalPrice: products.reduce((total, product) => {
//                     return total + 
//                         (product.price * product.quantity);
//                 }, 0)
//             };
//             return db.collection('orders').insertOne(order)
//         })
//         .then(result => {
//             // Order placed. Empty the cart
//             this.cart = {items: []};
//             return db.collection('users').updateOne({
//                 _id: new mongoDB.ObjectID(this._id)
//             }, {
//                 $set: {
//                     cart: {
//                         items: []
//                     }
//                 }
//             });
//         })
//         .catch(err => console.log(TAG, "addOrder", err));
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({
//             'user._id': new mongoDB.ObjectID(this._id)
//         }).toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//         .findOne({
//             _id: new mongoDB.ObjectID(userId)
//         })
//         .then(user => {
//             return user;
//         })
//         .catch(err => console.log(TAG, "findById", err));
//     }
// }

// module.exports = User;

// /**
//  * 
//  * 
//  * Sequelize(SQL Database) based Architecture
//  * 
//  * 
//  */


// // const Sequelize = require('sequelize');
// // const sequelize = require('../utility/database');

// // const User = sequelize.define('user', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     name: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     email: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     }
// // });

// // module.exports = User;