const fs = require("fs");
const path = require("path");
const fileLocation = path.join(__dirname, "..", "data", "products.json");

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    fs.readFile(fileLocation, (err, fileContent) => {
      const products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this)
      fs.writeFile(fileLocation, JSON.stringify(products), err=>{
          console.log(err)
      })
    });
  }

  static fetchAll() {
    fs.readFile(fileLocation,(err, fileContent)=>{
        if(err){
            return [];
        }
        return JSON.parse(fileContent)
    })
  }
};
