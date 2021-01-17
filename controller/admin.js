const Product = require('../models/product');

const TAG = 'admin_controller';

/*
    Admin Controller Logic
*/

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        activePath: '/admin/add-product',
        editing: false
    });
}

exports.postAddProduct = (req, res, next) => {
    //console.log(TAG, "postAddProduct", req.body);
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    if (!title || !imageURL || !price || !description) {
        console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
        res.redirect('/admin/add-product');
        return;
    }
    // Older version for MYSQL
    // const product = new Product(null, title, imageURL, price, description);
    // product.save().then(() => {
    //     res.redirect('/');
    // }).catch(
    //     err => console.log(TAG, "postAddProduct", err)
    // );

    // Create and store product
    // Product.create({
    //     title: title,
    //     price: price,
    //     imageURL: imageURL,
    //     description: description,
    //     userId: req.user.id
    // })
    req.user.createProduct({
        title: title,
        price: price,
        imageURL: imageURL,
        description: description
    })
    .then(result => {
        console.log(TAG, "postAddProduct", "Created Product");
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(TAG, "postAddProduct", err);
    });
}

exports.getEditProduct = (req, res, next) => {
    const isEditMode = req.query.edit;
    console.log(TAG, "postAddProduct", "EditMode: " + isEditMode);
    if (isEditMode === 'false' || !isEditMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    // Product.findById(productId, (product) => {
    //     if (!product) {
    //         console.log(TAG, "postAddProduct", "No product found for id: " + prodId);
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product', {
    //         docTitle: 'Add Product',
    //         activePath: '/admin/edit-product',
    //         editing: isEditMode,
    //         product: product
    //     });
    // });
    //Product.findByPk(productId)
    req.user.getProducts({
        where: {
            id: productId
        }
    })
    .then(products => {
        const product = products[0];
        if (!product) {
            console.log(TAG, "postAddProduct", "No product found for id: " + prodId);
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Add Product',
            activePath: '/admin/edit-product',
            editing: isEditMode,
            product: product
        });
    })
    .catch(err => console.log(TAG, "getEditProduct", err));
}

exports.postEditProduct = (req, res) => {
    //console.log(TAG, "postAddProduct", req.body);
    const id = req.body.productId;
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    if (!id || !title || !imageURL || !price || !description) {
        console.log(TAG, "postAddProduct", "Empty Data field! Ignore...");
        res.redirect('/admin/add-product');
        return;
    }
    Product.findByPk(id)
    .then(product => {
        product.title = title;
        product.imageURL = imageURL;
        product.price = price;
        product.description = description;

        // Update the product if exists else update
        return product.save();
    })
    .then(result => {
        console.log("Updated Product!!");
        res.redirect('/admin/products');
    })
    .catch(err => console.log(TAG, "postEditProduct", err));
}

exports.postDeleteProduct = (req, res) => {
    const id = req.body.productId;
    console.log(TAG, "postDeleteProduct", id);
    // Product.findById(id, (product) => {
    //     const tempProduct = new Product(product.id, product.title, product.imageURL, product.price, product.description);
    //     console.log(tempProduct);
    //     tempProduct.deleteProduct();
    // })
    Product.findByPk(id)
    .then(product => {
        return product.destroy();
    })
    .then(result => {
        console.log(TAG, "Product id: " + id + " destroyed");
        res.redirect("/admin/products");
    })
    .catch(err => console.log(TAG, "postDeleteProduct", err));
}

exports.getProductList = (req, res) => {
    // Product.fetchAll((productList) => {
    //     //console.log(TAG, productList);
    //     res.render('admin/products', {
    //         prods: productList,
    //         docTitle: 'Admin Products',
    //         activePath: '/admin/products'
    //     });
    // });

    //Product.findAll()
    req.user.getProducts()
    .then(products => {
        res.render('admin/products', {
            prods: products,
            docTitle: 'Admin Products',
            activePath: '/admin/products'
        });
    })
    .catch(err => 
        console.log(TAG, "getProductList", err));
}