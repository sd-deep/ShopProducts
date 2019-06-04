const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title : title,
    imageUrl : imageUrl,
    price : price,
    description : description,
    userId : req.user // mongoose will pick the _id from the object and assign --> explicitly req.user._id
  });
  product
    .save()// save method provided by mongoose
    .then(result => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  //Product.findByPk(prodId)
  Product.findById(prodId) // findById prodived by mongoose
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;


  Product.findById(prodId)
  .then(product =>{
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/')
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    return product.save()
    .then(result => {
      console.log("Product Updated");
      res.redirect("/admin/products");
    })
  })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId : req.user._id}) // find() -> mongoose method
  // .select and .populate 
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
    Product.deleteOne({userId:req.user._id, _id:prodId}) // findByIdAndremove -> mongoose static method
    .then(result => {
      console.log("Product deleted!!");
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};
