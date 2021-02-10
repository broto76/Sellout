const fs = require('fs');
const path = require('path');

const creds = require('../creds');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(creds.STRIPE_SECRET_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const TAG = 'shop_controller';

const ITEM_PER_PAGE = 2;

/*
    Shop Controller Logic
*/


/**
 * The following code should be uncommented for
 * using MongoDB.
 */

exports.getProducts = (req, res, next) => {
    let page = +req.query.page;
    let totalItems;
    if (!page) {
        console.log(TAG, "getProducts", 
            "Page undefined. Loading Page 1");
        page = 1;
    }

    Product.find().countDocuments()
    .then(totalProducts => {
        totalItems = totalProducts;
        return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .populate('userId'); 
    })
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'My Shop Products',
            activePath: '/products',
            totalProducts: totalItems,
            hasNextPage: ITEM_PER_PAGE * page < totalItems,
            hasPrevPage: page > 1,
            curPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
        });
    })
    .catch(err => {
        console.log(TAG, "getProducts", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getIndex = (req, res, next) => {
    let page = +req.query.page;
    let totalItems;
    if (!page) {
        console.log(TAG, "getIndex", 
            "Page undefined. Loading Page 1");
        page = 1;
    }

    Product.find().countDocuments()
    .then(totalProducts => {
        totalItems = totalProducts;
        return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)   // Starting index for fetching
        .limit(ITEM_PER_PAGE)
        .populate('userId');            // Number of items from ^ index
    })
    .then(products => {
        res.render('shop/index', {
            prods: products,
            docTitle: 'Welcome!',
            activePath: '/',
            totalProducts: totalItems,
            hasNextPage: ITEM_PER_PAGE * page < totalItems,
            hasPrevPage: page > 1,
            curPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
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
    .populate('userId')
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
    }).catch((err) => {
        console.log(TAG, "getProduct", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postCart = (req, res, next) => {
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

exports.getCart = (req, res, next) => {
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

exports.postCartDeleteItem = (req, res, next) => {
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

exports.getCheckout = (req, res, next) => {
    let products;
    let total;
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        products = user.cart.items;
        total = 0;
        products.forEach(prod => {
            total += (prod.productId.price * prod.quantity);
        });

        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: products.map(p => {
                return {
                    name: p.productId.title,
                    description: p.productId.description,
                    amount: p.productId.price * 100,
                    currency: 'INR',
                    quantity: p.quantity
                }
            }),
            // success_url: http://localhost:5000/checkout/success
            success_url: req.protocol + '://' + 
                            req.get('host') + '/checkout/success',
            // cancel_url: http://localhost:5000/checkout/cancel
            cancel_url: req.protocol + '://' + 
                            req.get('host') + '/checkout/cancel'
        });
    })
    .then(session => {
        res.render('shop/checkout', {
            docTitle: 'My Cart',
            activePath: '/checkout',
            products: products,
            totalSum: total,
            sessionId: session.id,
            publishableKey: creds.STRIPE_PUBLISHABLE_KEY
        });
    })
    .catch(err => {
        console.log(TAG, "getCheckout", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.getCheckoutSuccess = (req, res, next) => {
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

        const date = new Date();
        const orderDate = date.getDate() + '/' + 
            (+date.getMonth() + 1) + '/' +
            date.getFullYear();
        const orderTime = date.getHours() + ':' + 
            date.getMinutes() + ':' + 
            date.getSeconds();

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user._id
            },
            products: products,
            totalPrice: totalPrice,
            orderDate: orderDate,
            orderTime: orderTime
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

exports.postOrder = (req, res, next) => {
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

        const date = new Date();
        const orderDate = date.getDate() + '/' + 
            (+date.getMonth() + 1) + '/' +
            date.getFullYear();
        const orderTime = date.getHours() + ':' + 
            date.getMinutes() + ':' + 
            date.getSeconds();

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user._id
            },
            products: products,
            totalPrice: totalPrice,
            orderDate: orderDate,
            orderTime: orderTime
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

exports.getOrders = (req, res, next) => {
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

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then(order => {
        if (!order) {
            console.log(TAG, "getInvoice",
                "No order with id: " + orderId);
            return res.redirect('/orders');
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            console.log(TAG, "", "Not authorized to view invoice");
            return next(new Error('Unauthorized Access!'));
        }

        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            'inline; ' +
            //'attachment; ' +
            'filename="' + invoiceName + '"');
        pdfDoc.pipe(res);


        pdfDoc.fontSize(30).text('Invoice\n\n', {
            underline: true,
            align: 'center'
        });
        pdfDoc.fontSize(12);
        pdfDoc.text('Order ID: ' + order._id);
        pdfDoc.text('\nInvoice genration Date: ' + 
            order.orderDate + '  ' + order.orderTime);
        pdfDoc.fontSize(35);
        pdfDoc.text('\n************************\n', {
            align: 'center'
        });
        pdfDoc.fontSize(15);
        let cnt = 1;
        order.products.forEach(prod => {
            pdfDoc.text(cnt + '.' + 
                prod.product.title + ' (Quantity: ' +
                prod.quantity + ') x (Price: ' +
                prod.product.price + ')');
            cnt++;
        });
        pdfDoc.fontSize(35);
        pdfDoc.text('\n************************\n', {
            align: 'center'
        });
        pdfDoc.fontSize(25)
            .text('Total Price: ' + order.totalPrice);
        pdfDoc.fontSize(12)
            .text('\n\n\n\nThank You for shopping at Sellout!', {
                align: 'right'
            });

        pdfDoc.end();

        // Download file via preloading
        //
        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         console.log(TAG, "getInvoice", err);
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');

        //     // Uncomment this for inline view
        //     // res.setHeader('Content-Disposition', 'inline');

        //     // Uncomment the following line to download pdf
        //     res.setHeader('Content-Disposition',
        //         'attachment; ' +
        //         'filename="' + invoiceName + '"');
        //     res.send(data);
        //     console.log('Downloading Invoice....');
        // });


        // Download file via streaming. This helps saving 
        // server side memory.
        //
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition',
        //     'attachment; ' +
        //     'filename="' + invoiceName + '"');
        // file.pipe(res);
    })
    .catch(err => {
        console.log(TAG, "getInvoice", err);
        next(err);
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
