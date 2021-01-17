//const products = [];
const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const TAG = "product_model";
const p = path.join(path.dirname(require.main.filename),
    "data",
    "products.json"
);

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileData) => {
        if (err) {
            console.log(TAG,"getProductsFromFile", "Error while reading from file");
            console.log(TAG,"getProductsFromFile", err);
            cb([]);
        } else {
            cb(JSON.parse(fileData));
        }
    });
}

module.exports = class Product {
    /**
     * Class Product Structure
     * @param {*} name => Title of the product
     * @param {*} URL => URL for product image
     * @param {*} cost => Cost of product
     * @param {*} summary => Brief description of product
     */
    constructor(id, name, URL, cost, summary) {
        if (id)
            this.id = id;
        this.title = name;
        this.imageURL = URL;
        this.price = cost;
        this.description = summary;
    }

    save() {
        //products.push(this);
        getProductsFromFile((productList) => {
            if (this.id) {
                // Product already id'ed. So this is edit.
                const productIndex = productList.findIndex(p => p.id === this.id);
                if (productIndex === -1) {
                    console.log(TAG, "save", "Product not found with id:" + this.id);
                    return;
                }
                // Duplicate the productList
                const updatedProductList = [...productList];
                updatedProductList[productIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProductList), (err) => {
                    if (err) {
                        console.log(TAG, "save", "Error while writing to file");
                        console.log(TAG, "save", err);
                    }
                });
            } else {
                // Product has no id. This is create new product.
                this.id = Math.random().toString();
                productList.push(this);
                fs.writeFile(p, JSON.stringify(productList), (err) => {
                    if (err) {
                        console.log(TAG, "save", "Error while writing to file");
                        console.log(TAG, "save", err);
                    }
                });
            }
        });
    }

    deleteProduct() {
        if (!this.id) {
            console.log(TAG, "deleteProduct", "Product has no ID. Ignore!!");
            return;
        }
        getProductsFromFile((productList) => {
            const productIndex = productList.findIndex(p => p.id === this.id);
            if (productIndex === -1) {
                console.log(TAG, "deleteProduct", "No product found for index: " + this.index);
                return;
            }
            const updatedProductList = [...productList];
            updatedProductList.splice(productIndex, 1);
            //console.log(TAG, "deleteProduct", updatedProductList);
            fs.writeFile(p, JSON.stringify(updatedProductList), (err) => {
                if (err) {
                    console.log(TAG, "deleteProduct", "Error while writing to file");
                    console.log(TAG, "deleteProduct", err);
                }
            });
        });
    }

    static deleteById(id) {
        getProductsFromFile((productList => {
            const product = productList.find(p => p.id === id);
            const updatedProductList = productList.filter(p => p.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProductList), (err) => {
                if (err) {
                    console.log(TAG, "deleteProduct", "Error while writing to file");
                    console.log(TAG, "deleteProduct", err);
                } else {
                    Cart.deleteProduct(product.id, product.price);
                }
            });
        }));
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        getProductsFromFile((productList => {
            const product = productList.find(p => p.id === id);
            if (product) {
                cb(product);
            } else {
                console.log(TAG, "findById", "Cannot find product with id: " + id);
            }
        }));
    }
}