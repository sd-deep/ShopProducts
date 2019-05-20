const fs = require('fs');
const path = require('path')

const fileLocation = path.join(__dirname, "..", "data", "cart.json");


module.exports = class Cart {

    static addProduct(id, productPrice) {
        // fetch cart if already present
        fs.readFile(fileLocation, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(fileContent)
            }
            //analyzing the cart for existing product
            let exisitingProductIndex = cart.products.findIndex(product => product.id === id);
            let exisitingProduct = cart.products[exisitingProductIndex]
            let updatedProduct;
            if (exisitingProduct) { 
                updatedProduct = {...exisitingProduct}
                updatedProduct.qty = updatedProduct.qty +1;
                //cart.products = [...cart.products]
                cart.products[exisitingProductIndex] = updatedProduct;

            }
            else{
                updatedProduct = {id :id, qty : 1};
                cart.products = [...cart.products, updatedProduct]
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(fileLocation,JSON.stringify(cart),err=>{
                console.log(err)
            })
        })

    }
    
    static deleteProduct(id, productPrice){
        
        fs.readFile(fileLocation, (err,fileContent)=>{
            if(err){
                return;
            }
            const cart = JSON.parse(fileContent);
            
            const updatedCart = {...cart}
            const product = updatedCart.products.find(prod => prod.id === id)
            if(!product){
                return;
            }
            const productQty = product.qty;
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            
            fs.writeFile(fileLocation, JSON.stringify(updatedCart) , err =>{
                if(err){
                    console.log(err)
                }
            })
        });

    } 

    static getCart(callBack){
        fs.readFile(fileLocation, (err, fileContent) =>{
            const cart = JSON.parse(fileContent)
            if(err){
                
                callBack(null);
            }
            else{
                callBack(cart)
            }
        })
    }
}