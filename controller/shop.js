const Product = require('../models/product');
const Order = require('../models/order');

const TAG = 'shop_controller';

/*
    Shop Controller Logic
*/


/**
 * The following code should be uncommented for
 * using MongoDB.
 */

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'My Shop Products',
            activePath: '/products'
        });
    })
    .catch(err => {
        console.log(TAG, "getProducts", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getIndex = (req, res) => {
    Product.find()
    .then(products => {
        res.render('shop/index', {
            prods: products,
            docTitle: 'Welcome!',
            activePath: '/'
        });
    })
    .catch(err => {
        console.log(TAG, "getIndex", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
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

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        //console.log(result);
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(TAG, "postCart", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getCart = (req, res) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        // console.log(user.cart.items);
        const products = user.cart.items;
        res.render('shop/cart', {
            docTitle: 'My Cart',
            activePath: '/cart',
            products: products
        });
    })
    .catch(err => {
        console.log(TAG, "getCart", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postCartDeleteItem = (req, res) => {
    const prodId = req.body.productId;
    // console.log(TAG, "postCartDeleteItem", "ProductID: " + prodId);
    if (!prodId) {
        console.log(TAG, "postCartDeleteItem", "ProductID is null");
        return res.redirect('/cart');
    }
    req.user.deleteCartProduct(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(TAG, "postCartDeleteItem", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postOrder = (req, res) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(item => {
            return {
                quantity: item.quantity,
                // Use _doc to retrieve the complete data
                product: {...item.productId._doc}
            }
        });

        let totalPrice = 0;
        products.forEach(product => {
            totalPrice = totalPrice + 
                (product.quantity * product.product.price);
        });

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user._id
            },
            products: products,
            totalPrice: totalPrice
        });
        return order.save();
    })
    .then(result => {
        return req.user.clearCart();
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        console.log(TAG, "postOrder", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getOrders = (req, res) => {
    Order.find({
        'user.userId': req.user._id
    })
    .then(orders => {
        res.render('shop/order', {
            docTitle: 'My Order',
            activePath: '/orders',
            orders: orders
        });
    })
    .catch(err => {
        console.log(TAG, "getOrders", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
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

// exports.getProducts = (req, res, next) => {
//     Product.findAll()
//     .then(products => {
//         res.render('shop/product-list', {
//             prods: products,
//             docTitle: 'My Shop Products',
//             activePath: '/products'
//         });
//     })
//     .catch(err => 
//         console.log(TAG, "getProducts", err));
// }

// exports.getProduct = (req, res) => {
//     const prodId = req.params.productId;
//     // Product.findAll({
//     //     where: {
//     //         id: prodId
//     //     }
//     // })
//     // .then(products => {
//     //     res.render('shop/product-detail', {
//     //         product: products[0],
//     //         docTitle: products[0].title,
//     //         activePath: "/products"
//     //     });
//     // })
//     // .catch((err) => console.log(TAG, "getProduct", err));
//     Product.findByPk(prodId)
//     .then(product => {
//         if (!product) {
//             console.log(TAG, "getProduct", "No product found for id: " + prodId);
//             return res.redirect('/');
//         }
//         //console.log(product);
//         res.render('shop/product-detail', {
//             product: product,
//             docTitle: product.title,
//             activePath: "/products"
//         });
//     }).catch(
//         (err) => console.log(TAG, "getProduct", err)
//     );
// }

// exports.getIndex = (req, res) => {
//     //This would send hardcoded HTMl file
//     //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
//     Product.findAll()
//     .then(products => {
//         res.render('shop/index', {
//             prods: products,
//             docTitle: 'Welcome!',
//             activePath: '/'
//         });
//     })
//     .catch(err => 
//         console.log(TAG, "getIndex", err));
// }

// exports.postCart = (req, res) => {
//     const prodId = req.body.productId;
//     let fetchedCart;
//     let newQuantity = 1;
//     req.user.getCart()
//     .then(cart => {
//         fetchedCart = cart;
//         return cart.getProducts({
//             where: {
//                 id: prodId
//             }
//         });
//     })
//     .then(products => {
//         let product;
//         if (products.length > 0) {
//             product = products[0];
//         }
//         if (product) {
//             const oldQuantity = product.cartItem.quantity;
//             newQuantity = oldQuantity + 1;
//             return product;
//         }
//         return Product.findByPk(prodId)
//     })
//     .then(product=> {
//         return fetchedCart.addProduct(product, {
//             through: {
//                 quantity: newQuantity
//             }
//         });
//     })
//     .then(result => {
//         res.redirect('/cart');
//     })
//     .catch(err => console.log(TAG, "postCart", err));
// }

// exports.getCart = (req, res) => {
//     req.user.getCart()
//     .then(cart => {
//         return cart
//         .getProducts()
//         .then(products => {
//             res.render('shop/cart', {
//                 docTitle: 'My Cart',
//                 activePath: '/cart',
//                 products: products
//             });
//         })
//         .catch(err => console.log(TAG, "getCart", err));
//     })
//     .catch(err => console.log(TAG, "getCart", err));
//     // Cart.getCart((cart) => {
//     //     Product.fetchAll((productList) => {
//     //         const cartProducts = [];
//     //         for (product of productList) {
//     //             const cartProduct = cart.products.find(prod => prod.id === product.id);
//     //             if (cartProduct) {
//     //                 cartProducts.push({
//     //                     productData: product,
//     //                     qty: cartProduct.qty
//     //                 });
//     //             }
//     //         }

//     //         res.render('shop/cart', {
//     //             docTitle: 'My Cart',
//     //             activePath: '/cart',
//     //             products: cartProducts
//     //         });
//     //     });
//     // });
// }

// exports.postCartDeleteItem = (req, res) => {
//     const prodId = req.body.productId;
//     req.user.getCart()
//     .then(cart => {
//         return cart.getProducts({
//             where: {
//                 id: prodId
//             }
//         });
//     })
//     .then(products => {
//         const product = products[0];
//         // Remove row/entry from the intermediate cart-item table
//         return product.cartItem.destroy();
//     })
//     .then(result => {
//         res.redirect('/cart');
//     })
//     .catch(err => console.log(TAG, "postCartDeleteItem", err));
// }

// exports.getCheckout = (req, res) => {
//     res.render('shop/checkout', {
//         docTitle: 'Checkout',
//         activePath: '/checkout'
//     });
// }

// exports.postOrder = (req, res) => {
//     let fetchedCart;
//     req.user.getCart()
//     .then(cart => {
//         fetchedCart = cart;
//         return cart.getProducts();
//     })
//     .then(products => {
//         return req.user.createOrder()
//         .then(order => {
//             return order.addProducts(products.map(product => {
//                 product.orderItem = {
//                     quantity: product.cartItem.quantity
//                 }
//                 return product;
//             }));
//         })
//         .catch(err => console.log(TAG, "postOrder", err));
//     })
//     .then(result => {
//         return fetchedCart.setProducts(null);
//     })
//     .then(result => {
//         res.redirect('/orders');
//     })
//     .catch(err => console.log(TAG, "postOrder", err));
// }

// exports.getOrders = (req, res) => {
//     req.user.getOrders({
//         // eager loading. The result order array will contain
//         // the associated products with the order.
//         include: ['products']
//     })
//     .then(orders => {
//         // orders.forEach(order => {
//         //     console.log("\n\n");
//         //     //console.log(order.products);
//         //     console.log(order.id);
//         //     order.products.forEach(product => {
//         //         console.log("\n\n");
//         //         console.log(product.title);
//         //         console.log("\n\n");
//         //     });
//         //     console.log("\n\n");
//         // });
//         res.render('shop/order', {
//             docTitle: 'My Order',
//             activePath: '/orders',
//             orders: orders
//         });
//     })
//     .catch(err => console.log(TAG, "getOrders", err));
// }