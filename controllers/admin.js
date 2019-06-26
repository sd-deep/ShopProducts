const Product = require("../models/product");
const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check')

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    validationErrors: [],
    errorMessage: null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      errorMessage: 'Attached file is not a image (allowed types png, jpeg, jpg)',
      product: {
        title: title,
        price: price,
        description: description
      },
      hasError: true,
      validationErrors: []
    });
  }
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        price: price,
        description: description
      },
      hasError: true,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;//path to the file to be stored in db

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user // mongoose will pick the _id from the object and assign --> explicitly req.user._id
  });
  product
    .save()// save method provided by mongoose
    .then(result => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
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
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      hasError: true,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/')
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (updatedImage) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }
      return product.save()
        .then(result => {
          console.log("Product Updated");
          res.redirect("/admin/products");
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) // find() -> mongoose method
    // .select and .populate 
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    if (!product) {
      next(new Error('No product found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({ userId: req.user._id, _id: prodId }) // findByIdAndremove -> mongoose static method    
  })
    .then(() => {
      console.log("Product deleted!!");
      res.status(200).json({message : 'success!'});
    })
    .catch(err => {
      res.status(500).json({message : 'deleting product failed'})
    });
};
