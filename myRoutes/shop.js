const express = require('express');

const shopController = require('../controller/shop');
const isAuthenticatedChecker = require('../middleware/is-auth');

const TAG = 'shopjs';

const shopRouter = express.Router();

shopRouter.get('/', 
    shopController.getIndex);
shopRouter.get('/products', 
    shopController.getProducts);

shopRouter.get('/cart', 
    isAuthenticatedChecker,
    shopController.getCart);
shopRouter.post('/cart', 
    isAuthenticatedChecker,
    shopController.postCart);
shopRouter.post('/cart-delete-item', 
    isAuthenticatedChecker,
    shopController.postCartDeleteItem);

// // shopRouter.get('/checkout', shopController.getCheckout);

shopRouter.post('/create-order', 
    isAuthenticatedChecker,
    shopController.postOrder);
shopRouter.get('/orders', 
    isAuthenticatedChecker,
    shopController.getOrders);

// The same name(ie productId) should be used to extract the dynamic value in the route handler.
shopRouter.get('/products/:productId', 
    shopController.getProduct);

module.exports = shopRouter;