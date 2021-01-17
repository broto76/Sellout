const Cart = require('./cart');
const db = require('../utility/database');

const TAG = "product_model";

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
        return db.execute('INSERT INTO products ' +
        '(title, price, description, imageURL) VALUES ' +
        '(?, ?, ?, ?)', [
            this.title, this.price, this.description, this.imageURL
        ]);
    }

    static deleteById(id) {
        
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products ' + 
        'WHERE products.id = ?', [id]);
    }
}