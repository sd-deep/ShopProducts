const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'My Shop',
      path: '/'

    })
  });
}
  // get all products
  exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products'

      })
    });
  }

  exports.getProduct = (req,res,next) =>{
    const productId = req.params.productId;
    Product.findById(productId, product =>{
      res.render('shop/product-details',{
        product : product, 
        pageTitle : product.title, 
        path:'/products'})
    })
    
  }
  // export cart 
  exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
      pageTitle: 'My Cart',
      path: '/cart'
    })
  }

  exports.postCart = (req, res, next) => {
    productId = req.body.productId;
    Product.findById(productId, product=>{
      Cart.addProduct(productId,product.price)
      res.render('shop/cart', {
        pageTitle: 'My Cart',
        path: '/cart'
    })
    })
  }

  exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
      pageTitle: 'My Orders',
      path: '/orders'
    })
  }
  // export checkout
  exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout'
    })
  }

  /* res.sendFile(path.join(rootDir, 'views', 'shop.html')); */
