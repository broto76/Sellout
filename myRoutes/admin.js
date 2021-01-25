const express = require('express');
const path = require('path');

const rootDir = require('../utility/path');
const adminController = require('../controller/admin');
const isAuthenticatedChecker = require('../middleware/is-auth');

const adminRouter = express.Router();

// Complete URL : /admin/add-product, Method : GET
adminRouter.get('/add-product', 
    isAuthenticatedChecker,
    adminController.getAddProduct);
// Complete URL : /admin/add-product, Method : POST
adminRouter.post('/add-product', 
    isAuthenticatedChecker,
    adminController.postAddProduct);

// Complete URL : /admin/products, Method : GET
adminRouter.get('/products', 
    isAuthenticatedChecker,
    adminController.getProductList);

// // Complete URL : /admin/edit-product/:productId, Method : GET
adminRouter.get('/edit-product/:productId',
    isAuthenticatedChecker, 
    adminController.getEditProduct);
// Complete URL : /admin/edit-product, Method : POST
adminRouter.post('/edit-product', 
    isAuthenticatedChecker,
    adminController.postEditProduct);

adminRouter.post('/delete-product', 
    isAuthenticatedChecker,
    adminController.postDeleteProduct);

module.exports = adminRouter;