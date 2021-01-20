
// /**
//  * Mongoose based design
//  */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    userId: {
        // Create the relation with the user model via
        // the user._id field.
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// The string will be used as collection name
module.exports = mongoose.model('Product', productSchema)

// /**
//  * MongoDB based design
//  */

// const mongoDB = require('mongodb');
// const getDb = require('../utility/database').getDb;

// const TAG = "Product_Model";

// class Product {
//     constructor(title, price, description, imageURL, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageURL = imageURL;
//         if (id)
//             this._id = new mongoDB.ObjectID(id);
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             // Already exists. Update product
//             dbOp = db.collection('products').updateOne({
//                 // Constraint to find object to updated
//                 _id: this._id
//             }, {
//                 // New value to be updated on the above object
//                 $set: this
//             });
//         } else {
//             dbOp = db.collection('products').insertOne(this);
//         }
//         return dbOp
//         .then(result => {
//             console.log(result);
//         })
//         .catch(err => console.log(TAG, "save", err));
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products').find().toArray()
//         .then(products => {
//             //console.log(products);
//             return products;
//         })
//         .catch(err => console.log(TAG, "fetchAll", err));
//     }

//     static findById(productId) {
//         const db = getDb();
//         return db.collection('products').find({
//             // In mongodb the id is stored in form of object
//             _id: new mongoDB.ObjectId(productId)
//         }).next()
//         .then(product => {
//             return product;
//         })
//         .catch(err => console.log(TAG, "findById", err));
//     }

//     static deleteById(productId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({
//             _id: new mongoDB.ObjectID(productId)
//         })
//         .then(result => {
//             console.log(TAG, "deleteById", "Deleted product: " + productId);
//         })
//         .catch(err => console.log(TAG, "deleteById", err));
//     }

// }

// module.exports = Product;






// // /**
// //  * Sequelize(SQL Database) based Architecture
// //  */

// // const Sequelize = require('sequelize');
// // const sequelize = require('../utility/database');

// // const Product = sequelize.define('product', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     title: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     price: {
// //         type: Sequelize.DOUBLE,
// //         allowNull: false
// //     },
// //     imageURL: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     description: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     }
// // });
