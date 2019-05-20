const fs = require("fs");
const path = require("path");
const Cart = require('./cart')
const fileLocation = path.join(__dirname, "..", "data", "products.json");

const getProductsFromFile = callBack =>{
  fs.readFile(fileLocation,(err, fileContent)=>{
    if(err){
        return callBack([]);
    }
    callBack(JSON.parse(fileContent))
})
}


module.exports = class Product {
  constructor(id, title,imageUrl,price,description) {
    this.id = id;
    this.title = title;
    this.imageUrl=imageUrl;
    this.price=price;
    this.description=description;
  }

  save() {
    getProductsFromFile(products=>{
      // check if product already exists
      if(this.id){
        const existingProductIndex = products.findIndex(prod => prod.id === this.id)
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(fileLocation, JSON.stringify(updatedProducts), err=>{
          console.log(err)
      })
      }
      else{
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(fileLocation, JSON.stringify(products), err=>{
            console.log(err)
        });

      }
    });
  }

  static fetchAll(callBack) {
    getProductsFromFile(callBack)
  }

  static findById(id, callBack ){
    getProductsFromFile(products =>{
      const product = products.find(prod => prod.id === id);
      callBack(product)
    })

  }

  static deleteById (id){
    getProductsFromFile(products =>{
      console.log("reading file")
      const product = products.find(prod=> prod.id === id);
      console.log("got the product")
      const productPrice = product.price;
      console.log("here is the price found")
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(fileLocation, JSON.stringify(updatedProducts), err =>{
          if(!err){
            console.log('file updated and now trying to update cart')
            Cart.deleteProduct(id, productPrice);
          }
      })
    })

  }
};
