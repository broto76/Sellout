const Product = require('../models/product');

const TAG = 'shop_controller';

/*
    Shop Controller Logic
*/

exports.getProducts = (req, res, next) => {
    Product.findAll()
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'My Shop Products',
            activePath: '/products'
        });
    })
    .catch(err => 
        console.log(TAG, "getProducts", err));
}

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    // Product.findAll({
    //     where: {
    //         id: prodId
    //     }
    // })
    // .then(products => {
    //     res.render('shop/product-detail', {
    //         product: products[0],
    //         docTitle: products[0].title,
    //         activePath: "/products"
    //     });
    // })
    // .catch((err) => console.log(TAG, "getProduct", err));
    Product.findByPk(prodId)
    .then(product => {
        if (!product) {
            console.log(TAG, "getProduct", "No product found for id: " + prodId);
            return res.redirect('/');
        }
        //console.log(product);
        res.render('shop/product-detail', {
            product: product,
            docTitle: product.title,
            activePath: "/products"
        });
    }).catch(
        (err) => console.log(TAG, "getProduct", err)
    );
}

exports.getIndex = (req, res) => {
    //This would send hardcoded HTMl file
    //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    Product.findAll()
    .then(products => {
        res.render('shop/index', {
            prods: products,
            docTitle: 'Welcome!',
            activePath: '/'
        });
    })
    .catch(err => 
        console.log(TAG, "getIndex", err));
}

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({
            where: {
                id: prodId
            }
        });
    })
    .then(products => {
        let product;
        if (products.length > 0) {
            product = products[0];
        }
        if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product;
        }
        return Product.findByPk(prodId)
    })
    .then(product=> {
        return fetchedCart.addProduct(product, {
            through: {
                quantity: newQuantity
            }
        });
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(TAG, "postCart", err));
}

exports.getCart = (req, res) => {
    req.user.getCart()
    .then(cart => {
        return cart
        .getProducts()
        .then(products => {
            res.render('shop/cart', {
                docTitle: 'My Cart',
                activePath: '/cart',
                products: products
            });
        })
        .catch(err => console.log(TAG, "getCart", err));
    })
    .catch(err => console.log(TAG, "getCart", err));
    // Cart.getCart((cart) => {
    //     Product.fetchAll((productList) => {
    //         const cartProducts = [];
    //         for (product of productList) {
    //             const cartProduct = cart.products.find(prod => prod.id === product.id);
    //             if (cartProduct) {
    //                 cartProducts.push({
    //                     productData: product,
    //                     qty: cartProduct.qty
    //                 });
    //             }
    //         }

    //         res.render('shop/cart', {
    //             docTitle: 'My Cart',
    //             activePath: '/cart',
    //             products: cartProducts
    //         });
    //     });
    // });
}

exports.postCartDeleteItem = (req, res) => {
    const prodId = req.body.productId;
    req.user.getCart()
    .then(cart => {
        return cart.getProducts({
            where: {
                id: prodId
            }
        });
    })
    .then(products => {
        const product = products[0];
        // Remove row/entry from the intermediate cart-item table
        return product.cartItem.destroy();
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(TAG, "postCartDeleteItem", err));
}

// exports.getCheckout = (req, res) => {
//     res.render('shop/checkout', {
//         docTitle: 'Checkout',
//         activePath: '/checkout'
//     });
// }

exports.postOrder = (req, res) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return req.user.createOrder()
        .then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = {
                    quantity: product.cartItem.quantity
                }
                return product;
            }));
        })
        .catch(err => console.log(TAG, "postOrder", err));
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(TAG, "postOrder", err));
}

exports.getOrders = (req, res) => {
    req.user.getOrders({
        // eager loading. The result order array will contain
        // the associated products with the order.
        include: ['products']
    })
    .then(orders => {
        // orders.forEach(order => {
        //     console.log("\n\n");
        //     //console.log(order.products);
        //     console.log(order.id);
        //     order.products.forEach(product => {
        //         console.log("\n\n");
        //         console.log(product.title);
        //         console.log("\n\n");
        //     });
        //     console.log("\n\n");
        // });
        res.render('shop/order', {
            docTitle: 'My Order',
            activePath: '/orders',
            orders: orders
        });
    })
    .catch(err => console.log(TAG, "getOrders", err));
}