const getDb = require('../util/database').getDb
const mongodb = require('mongodb')

class User {
    constructor(name, email, cart, _id) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id = _id;
    }


    save() {
        const db = getDb()
        return db.collection('users').insertOne(this)
            .then(result => {
                console.log('user created!!')
            }).catch(err => {
                console.log(err)
            })
    }

    addToCart(product) {
        //if product present in cart //add quantity to the existing product
        console.log("this is the id to match" + product._id.toString())
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString()
        })
        let newQuantity = 1;
        let updatedCartItems = [...this.cart.items]
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        //else add product with quantity one in the user document
        else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity
            });
        }
        const updatedCart = {
            items: updatedCartItems
        }

        const db = getDb();
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: updatedCart  }})


    }

    getCart() {

        const db = getDb();
        const productIds = this.cart.items.map(i => {
            return i.productId;
        });
        return db.collection('products').find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    }
                })
            })
    }


    static findUserById(userId) {
        const db = getDb()
        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) })
            .then(user => {
                console.log(user)
                return user
            }).catch(err => {
                console.log(err)
            })

    }

    deleteItemFromCart(productId){
        const updatedCart = this.cart.items.filter(item=>{
            return item.productId.toString() !== productId.toString()
        })

        const db = getDb();
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set:  {cart: {items : updatedCart }} })
    }


}

module.exports = User;