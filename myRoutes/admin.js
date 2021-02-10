const express = require('express');
const path = require('path');
const { check, body } = require('express-validator/check');

const rootDir = require('../utility/path');
const adminController = require('../controller/admin');
const isAuthenticatedChecker = require('../middleware/is-auth');
const isVerifiedChecker = require('../middleware/is-verified');

const adminRouter = express.Router();

// Complete URL : /admin/add-product, Method : GET
adminRouter.get('/add-product', 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.getAddProduct);
// Complete URL : /admin/add-product, Method : POST
adminRouter.post('/add-product',
    [
        // Validate titile
        body('title')
            .isString()
            .isLength({
                min: 3
            })
            .trim(),
        // Validate Description
        body('description')
        .isLength({
            min: 5,
            max: 500
        })
        .trim()
    ], 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.postAddProduct);

// Complete URL : /admin/products, Method : GET
adminRouter.get('/products', 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.getProductList);


// // Complete URL : /admin/edit-product/:productId, Method : GET
adminRouter.get('/edit-product/:productId',
    isAuthenticatedChecker, 
    isVerifiedChecker,
    adminController.getEditProduct);
// Complete URL : /admin/edit-product, Method : POST
adminRouter.post('/edit-product',
    [
        // Validate titile
        body('title')
            .isString()
            .isLength({
                min: 3
            })
            .trim(),
        // Validate Description
        body('description')
        .isLength({
            min: 5,
            max: 500
        })
        .trim()
    ], 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.postEditProduct);


adminRouter.post('/delete-product', 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.postDeleteProduct);
adminRouter.delete('/product/:productId', 
    isAuthenticatedChecker,
    isVerifiedChecker,
    adminController.deleteProduct);

module.exports = adminRouter;
