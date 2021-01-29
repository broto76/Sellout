const TAG = 'admin_controller';

/*
    Admin Controller Logic
*/

/**
 * 
 * 
 * The following code should be uncommented for
 * using MongoDB.
 * 
 * 
 */

const { validationResult } = require('express-validator/check')

const fileHelper = require('../utility/file');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        activePath: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postAddProduct = (req, res, next) => {
    //console.log(TAG, "postAddProduct", req.body);
    const title = req.body.title;
    //const imageURL = req.body.imageURL;
    const imageFile = req.file;
    const price = req.body.price;
    const description = req.body.description;

    console.log(TAG, "req.file: ", imageFile);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(TAG, "postAddProduct", errors.array());
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            activePath: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                title: title,
                price: price,
                description: description
            }
        });
    }

    if (!imageFile) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            activePath: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: "Invalid image uploaded",
            validationErrors: [],
            product: {
                title: title,
                price: price,
                description: description
            }
        });
    }

    if (!title || !price || !description) {
        console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            activePath: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: "Empty Input field(s)",
            validationErrors: [],
            product: {
                title: title,
                price: price,
                description: description
            }
        });
    }

    const imageURL = imageFile.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageURL: imageURL,
        userId: req.user._id
    });
    product.save()
    .then(result => {
        console.log(TAG, "postAddProduct", "Created Product");
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(TAG, "postAddProduct", err);
        //res.status(500).redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getProductList = (req, res, next) => {
    // Only fetch products owned by the current user.
    Product.find({
        userId: req.user._id
    })
    // Populate the entire User data to userId
    //.populate('userId','name')
    // Select the attributes needed in the fetched object
    //.select('title price')
    .then(products => {
        //console.log(products);
        res.render('admin/products', {
            prods: products,
            docTitle: 'Admin Products',
            activePath: '/admin/products'
        });
    })
    .catch(err => {
        console.log(TAG, "getProductList", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getEditProduct = (req, res, next) => {
    const isEditMode = req.query.edit;
    console.log(TAG, "postAddProduct", "EditMode: " + isEditMode);
    if (isEditMode === 'false' || !isEditMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    if (!productId) {
        console.log(TAG, "getEditProduct", "Product Id empty");
        return res.redirect('/');
    }
    Product.findById(productId)
    .then(product => {
        if (!product) {
            console.log(TAG, "postAddProduct", "No product found for id: " + prodId);
            return res.redirect('/');
        }
        //console.log("Debug", "Description: " + product.description);
        res.render('admin/edit-product', {
            docTitle: 'Add Product',
            activePath: '/admin/edit-product',
            editing: isEditMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    })
    .catch(err => {
        console.log(TAG, "getEditProduct", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
    //console.log(TAG, "postAddProduct", req.body);
    const id = req.body.productId;
    const title = req.body.title;
    const imageFile = req.file;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(TAG, "postEditProduct", errors.array());
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Product',
            activePath: '/admin/add-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                title: title,
                price: price,
                description: description,
                _id: id
            }
        });
    }

    if (!id || !title || !price || !description) {
        console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Product',
            activePath: '/admin/add-product',
            editing: true,
            hasError: true,
            errorMessage: "Empty Input field(s)",
            validationErrors: [],
            product: {
                title: title,
                price: price,
                description: description,
                _id: id
            }
        });
    }
    
    // const product = new Product(
    //     title, 
    //     price, 
    //     description, 
    //     imageURL, 
    //     id);
    Product.findById(id)
    .then(product => {
        // The product in callback is a complete mongoose object.
        // This will have all the class methods.

        if (product.userId.toString() !== req.user._id.toString()) {
            console.log(TAG, "postEditProduct", "Unauthorized" +
                " attempt to edit product");
            return res.redirect('/');
        }

        product.title = title;
        console.log();
        if (imageFile) {
            fileHelper.deleteFile(product.imageURL);
            product.imageURL = imageFile.path;
        }
        product.price = price;
        product.description = description;
        return product.save()
        .then(result => {
            console.log("Updated Product!!");
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(TAG, "postEditProduct", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
    })
    .catch(err => {
        console.log(TAG, "postEditProduct", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productId;
    console.log(TAG, "postDeleteProduct", id);

    Product.findById(id)
    .then(product => {
        if (!product) {
            console.log(TAG, "", 
                "No Product found for id: " + id);
            return res.redirect('/admin/products');
        }
        fileHelper.deleteFile(product.imageURL);
        return Product.deleteOne({
            _id: id,
            userId: req.user._id
        });
    })
    .then(result => {
        console.log(TAG, "Product id: " + id + " destroyed");
        res.redirect("/admin/products");
    })
    .catch(err => {
        console.log(TAG, "postDeleteProduct", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });

    // Product.deleteById(id)
    //Product.findByIdAndRemove(id)
}


/**
 * 
 * 
 * The following code should be uncommented for
 * using the sequelize architecture.
 * 
 * 
 * 
 */

// exports.getAddProduct = (req, res, next) => {
//     res.render('admin/edit-product', {
//         docTitle: 'Add Product',
//         activePath: '/admin/add-product',
//         editing: false
//     });
// }

// exports.postAddProduct = (req, res, next) => {
//     //console.log(TAG, "postAddProduct", req.body);
//     const title = req.body.title;
//     const imageURL = req.body.imageURL;
//     const price = req.body.price;
//     const description = req.body.description;
//     if (!title || !imageURL || !price || !description) {
//         console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
//         res.redirect('/admin/add-product');
//         return;
//     }
//     // Older version for MYSQL
//     // const product = new Product(null, title, imageURL, price, description);
//     // product.save().then(() => {
//     //     res.redirect('/');
//     // }).catch(
//     //     err => console.log(TAG, "postAddProduct", err)
//     // );

//     // Create and store product
//     // Product.create({
//     //     title: title,
//     //     price: price,
//     //     imageURL: imageURL,
//     //     description: description,
//     //     userId: req.user.id
//     // })
//     req.user.createProduct({
//         title: title,
//         price: price,
//         imageURL: imageURL,
//         description: description
//     })
//     .then(result => {
//         console.log(TAG, "postAddProduct", "Created Product");
//         res.redirect('/admin/products');
//     })
//     .catch(err => {
//         console.log(TAG, "postAddProduct", err);
//     });
// }

// exports.getEditProduct = (req, res, next) => {
//     const isEditMode = req.query.edit;
//     console.log(TAG, "postAddProduct", "EditMode: " + isEditMode);
//     if (isEditMode === 'false' || !isEditMode) {
//         return res.redirect('/');
//     }
//     const productId = req.params.productId;
//     // Product.findById(productId, (product) => {
//     //     if (!product) {
//     //         console.log(TAG, "postAddProduct", "No product found for id: " + prodId);
//     //         return res.redirect('/');
//     //     }
//     //     res.render('admin/edit-product', {
//     //         docTitle: 'Add Product',
//     //         activePath: '/admin/edit-product',
//     //         editing: isEditMode,
//     //         product: product
//     //     });
//     // });
//     //Product.findByPk(productId)
//     req.user.getProducts({
//         where: {
//             id: productId
//         }
//     })
//     .then(products => {
//         const product = products[0];
//         if (!product) {
//             console.log(TAG, "postAddProduct", "No product found for id: " + prodId);
//             return res.redirect('/');
//         }
//         res.render('admin/edit-product', {
//             docTitle: 'Add Product',
//             activePath: '/admin/edit-product',
//             editing: isEditMode,
//             product: product
//         });
//     })
//     .catch(err => console.log(TAG, "getEditProduct", err));
// }

// exports.postEditProduct = (req, res) => {
//     //console.log(TAG, "postAddProduct", req.body);
//     const id = req.body.productId;
//     const title = req.body.title;
//     const imageURL = req.body.imageURL;
//     const price = req.body.price;
//     const description = req.body.description;
//     if (!id || !title || !imageURL || !price || !description) {
//         console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
//         res.redirect('/admin/add-product');
//         return;
//     }
//     Product.findByPk(id)
//     .then(product => {
//         product.title = title;
//         product.imageURL = imageURL;
//         product.price = price;
//         product.description = description;

//         // Update the product if exists else update
//         return product.save();
//     })
//     .then(result => {
//         console.log("Updated Product!!");
//         res.redirect('/admin/products');
//     })
//     .catch(err => console.log(TAG, "postEditProduct", err));
// }

// exports.postDeleteProduct = (req, res) => {
//     const id = req.body.productId;
//     console.log(TAG, "postDeleteProduct", id);
//     // Product.findById(id, (product) => {
//     //     const tempProduct = new Product(product.id, product.title, product.imageURL, product.price, product.description);
//     //     console.log(tempProduct);
//     //     tempProduct.deleteProduct();
//     // })
//     Product.findByPk(id)
//     .then(product => {
//         return product.destroy();
//     })
//     .then(result => {
//         console.log(TAG, "Product id: " + id + " destroyed");
//         res.redirect("/admin/products");
//     })
//     .catch(err => console.log(TAG, "postDeleteProduct", err));
// }

// exports.getProductList = (req, res) => {
//     // Product.fetchAll((productList) => {
//     //     //console.log(TAG, productList);
//     //     res.render('admin/products', {
//     //         prods: productList,
//     //         docTitle: 'Admin Products',
//     //         activePath: '/admin/products'
//     //     });
//     // });

//     //Product.findAll()
//     req.user.getProducts()
//     .then(products => {
//         res.render('admin/products', {
//             prods: products,
//             docTitle: 'Admin Products',
//             activePath: '/admin/products'
//         });
//     })
//     .catch(err => 
//         console.log(TAG, "getProductList", err));
// }