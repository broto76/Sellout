const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// HandleBars import
//const expressHbs = require('express-handlebars');

const adminRoutes = require('./myRoutes/admin');
const shopRoutes = require('./myRoutes/shop');
const rootDir = require('./utility/path');
const errorHandlerController = require('./controller/errorHandler');
const sequelize = require('./utility/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

// Notify express that PUG templating engine is used
//app.set('view engine', 'pug');

app.set('view engine','ejs');
// Notify engine where the HTML templates are stored
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

// Grant access to public dir
app.use(express.static(path.join(rootDir, "public")));

// Populate the user field
app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log("MainApp error while fetching user", err));
});

// The URL would be stripped off the filter before sending it
// to the adminRoutes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// This should only handle the undefined routes.
app.use(errorHandlerController.pageNotFoundRouter);


/**
 * Database Relation Management
 *
 * All relations between models are established here
 * 
 */

// One-to-one mapping for Product and OwnerUser model
Product.belongsTo(User, {
    constraints: true,
    // Products will be deleted when the owner User is deleted
    onDelete: 'CASCADE'
});
// One-to-many mapping for User and Product Model
User.hasMany(Product);


// One-to-one mapping for User and Cart
User.hasOne(Cart);
Cart.belongsTo(User);
// Many-to-Many mapping for Cart and Product. This requires
// an intermediate cart-item model.
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});


// One-to-One relation for order and user
Order.belongsTo(User);
// One-to_Many mapping for user and order
User.hasMany(Order);
// Many-to-Many mapping for Order and Product. This requires
// an intermediate order-item model.
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});

/**
 * Verify database access and create tables if required.
 * On success, start the server.
 */


// This would create the table based on Model definations
sequelize
.sync()
// .sync({force: true})
.then(result => {
    return User.findByPk(1);
    //console.log(result);
})
.then(user => {
    if (!user) {
        return User.create({
            name: 'Joe',
            email: 'joeGreene@hello.com'
        });
    }
    return user;
})
.then(user => {
    user.createCart();
})
.then(cart => {
    app.listen(5000);
})
.catch(err => {
    console.log(err);
});