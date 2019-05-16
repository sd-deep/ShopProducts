const Product  = require('../models/product')

exports.getAddProducts = (req, res, next) => {
    res.render('add-product',{
      pageTitle : 'Add Product', 
      path : '/admin/add-product',
      activeAddProduct : true,
      formsCSS : true,
      productCSS : true})
    /* res.sendFile(path.join(rootDir, 'views', 'add-product.html')); */
  }

exports.postProducts = (req, res, next) => {
    console.log(req.body)
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
  }

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll();
    res.render('shop', {
      prods : products, 
      pageTitle : 'My Shop', 
      path : '/'
      
    })
    /* res.sendFile(path.join(rootDir, 'views', 'shop.html')); */
  }