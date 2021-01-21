// Older MySQL pattern (deprecated)

// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'p!nkfloyd'
// });

// module.exports = pool.promise();


/**
 * Sequeliza based approach
 */
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete','root','p!nkfloyd', {
//     dialect: 'mysql', 
//     host: 'localhost'
// });

// module.exports = sequelize;


/**
 * MondoDB based database
 */

// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//     MongoClient
//     .connect('<Link tp db>')
//     .then(client => {
//         console.log('Connected!');
//         _db = client.db();
//         callback();
//     })
//     .catch(err => {
//         console.log("MongoDBUtility", "mongoConnect", err);
//         throw err;
//     });
// }

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }
//     throw 'No MongoDB Connection Found!';
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
