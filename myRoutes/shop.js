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

shopRouter.get('/checkout', 
    isAuthenticatedChecker,
    shopController.getCheckout);
shopRouter.get('/checkout/success', 
    isAuthenticatedChecker,
    shopController.getCheckoutSuccess);
shopRouter.get('/checkout/cancel', 
    isAuthenticatedChecker,
    shopController.getCheckout);

shopRouter.post('/create-order', 
    isAuthenticatedChecker,
    shopController.postOrder);
shopRouter.get('/orders', 
    isAuthenticatedChecker,
    shopController.getOrders);

// The same name(ie productId) should be used to extract the dynamic value in the route handler.
shopRouter.get('/products/:productId', 
    shopController.getProduct);

shopRouter.get('/orders/:orderId',
    isAuthenticatedChecker,
    shopController.getInvoice);

shopRouter.get('/messages-main',
    isAuthenticatedChecker,
    shopController.getMessagesMain);

shopRouter.get('/messages/:remoteUser',
    isAuthenticatedChecker,
    shopController.getMessages);

shopRouter.post('/sendMessage',
    isAuthenticatedChecker,
    shopController.postSendMessage);

module.exports = shopRouter;
