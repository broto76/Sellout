const express = require('express');
const path = require('path');

const rootDir = require('../utility/path');
const adminController = require('../controller/admin');

const adminRouter = express.Router();

// Complete URL : /admin/add-product, Method : GET
adminRouter.get('/add-product', adminController.getAddProduct);
// Complete URL : /admin/add-product, Method : POST
adminRouter.post('/add-product', adminController.postAddProduct);

// Complete URL : /admin/products, Method : GET
adminRouter.get('/products', adminController.getProductList);

// // Complete URL : /admin/edit-product/:productId, Method : GET
adminRouter.get('/edit-product/:productId', adminController.getEditProduct);
// Complete URL : /admin/edit-product, Method : POST
adminRouter.post('/edit-product', adminController.postEditProduct);

adminRouter.post('/delete-product', adminController.postDeleteProduct);

module.exports = adminRouter;