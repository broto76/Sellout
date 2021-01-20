const express = require('express');

const shopController = require('../controller/shop');

const TAG = 'shopjs';

const shopRouter = express.Router();

shopRouter.get('/', shopController.getIndex);
shopRouter.get('/products', shopController.getProducts);

shopRouter.get('/cart', shopController.getCart);
shopRouter.post('/cart', shopController.postCart);
shopRouter.post('/cart-delete-item', shopController.postCartDeleteItem);

// // shopRouter.get('/checkout', shopController.getCheckout);

shopRouter.post('/create-order', shopController.postOrder);
shopRouter.get('/orders', shopController.getOrders);

// The same name(ie productId) should be used to extract the dynamic value in the route handler.
shopRouter.get('/products/:productId', shopController.getProduct);

module.exports = shopRouter;