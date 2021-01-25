const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const mySession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(mySession);
const csrf = require('csurf');
const flash = require('connect-flash');
// HandleBars import
//const expressHbs = require('express-handlebars');

const adminRoutes = require('./myRoutes/admin');
const shopRoutes = require('./myRoutes/shop');
const authRoutes = require('./myRoutes/auth');
const rootDir = require('./utility/path');
const errorHandlerController = require('./controller/errorHandler');

/**
 * Uncomment the following for using Sequelize DB
 */
// const sequelize = require('./utility/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

const User = require('./models/user');

const MONGODB_URI = 'Link to Mongo server';

// Uncomment the following to use vanilla mongodb driver
// const mongoConnect = require('./utility/database').mongoConnect;

const app = express();

// create a mongodbstore for storing the session in db
const myStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

// Initialize cusrf library
const csrfProtection = csrf();

// Notify express that PUG templating engine is used
//app.set('view engine', 'pug');

app.set('view engine','ejs');
// Notify engine where the HTML templates are stored
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

// Grant access to public dir
app.use(express.static(path.join(rootDir, "public")));

// Added the session data in the request via
// a common middleware
app.use(mySession({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: myStore
}));
// Check for csrf token validity for post requests
app.use(csrfProtection);

// Addinf flash middleware
app.use(flash());

// Populate the user field
app.use((req, res, next) => {
    // Uncomment the following code if sequelize is used.
    // This will select user[0] as the active user.
    // User.findByPk(1)
    // .then(user => {
    //     req.user = user;
    //     next();
    // })
    // .catch(err => console.log("MainApp error while fetching user", err));

    // MongoDB Useage
    // Find the hardcoded user

    if (req.session.user) {
        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    console.log('No User Found!');
                    return;
                }
                // user is a full mongoose model
                req.user = user;
                if (req.url.toString() != '/login')
                    next();
                else
                    res.redirect('/');
            })
            .catch(err => console.log("MainApp error while " +
            "fetching user", err));
        } else {
            //console.log("No User session found. Please Login.");
            next();
        }
});

// Add the common key value pairs to be passed to
// all the ejs views.
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// The URL would be stripped off the filter before sending it
// to the adminRoutes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// This should only handle the undefined routes.
app.use(errorHandlerController.pageNotFoundRouter);

/** 
 * Mongoose Useage
 */

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(result => {
        app.listen(5000);
        console.log('Server Running');
    })
    .catch(err => console.log(TAG, "Error while connecting to db", err));

/**
 * MongoDB based design
 */
// mongoConnect((client) => {
//     app.listen(5000);
// });



// /**
//  * Sequelize(SQL Database) based Architecture
//  */

// /**
//  * Database Relation Management
//  *
//  * All relations between models are established here
//  * 
//  */

// // One-to-one mapping for Product and OwnerUser model
// Product.belongsTo(User, {
//     constraints: true,
//     // Products will be deleted when the owner User is deleted
//     onDelete: 'CASCADE'
// });
// // One-to-many mapping for User and Product Model
// User.hasMany(Product);


// // One-to-one mapping for User and Cart
// User.hasOne(Cart);
// Cart.belongsTo(User);
// // Many-to-Many mapping for Cart and Product. This requires
// // an intermediate cart-item model.
// Cart.belongsToMany(Product, {through: CartItem});
// Product.belongsToMany(Cart, {through: CartItem});


// // One-to-One relation for order and user
// Order.belongsTo(User);
// // One-to_Many mapping for user and order
// User.hasMany(Order);
// // Many-to-Many mapping for Order and Product. This requires
// // an intermediate order-item model.
// Order.belongsToMany(Product, {through: OrderItem});
// Product.belongsToMany(Order, {through: OrderItem});

// /**
//  * Verify database access and create tables if required.
//  * On success, start the server.
//  */


// // This would create the table based on Model definations
// sequelize
// .sync()
// // .sync({force: true})
// .then(result => {
//     return User.findByPk(1);
//     //console.log(result);
// })
// .then(user => {
//     if (!user) {
//         return User.create({
//             name: 'Joe',
//             email: 'joeGreene@hello.com'
//         });
//     }
//     return user;
// })
// .then(user => {
//     user.createCart();
// })
// .then(cart => {
//     app.listen(5000);
// })
// .catch(err => {
//     console.log(err);
// });