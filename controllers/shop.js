const Product = require('../models/product');
//const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Shop products',
        path: '/products'
      });

    })
    .catch(err => {
      console.log(err)
    });

}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-details', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err)
    })

}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });

    })
    .catch(err => {
      console.log(err)
    });

}

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cartProducts => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    })
  
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      req.user.addToCart(product)
    }).then(result=>{
      res.redirect('/cart');

    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId);
    res.redirect('/cart');

};


exports.postOrder = (req, res, next) => {
  req.user.addOrder()
  .then(results =>{

    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders'
    });
  }).catch(err=>{
    console.log('err in getorders'+err)
  })
};

exports.getOrders = (req, res, next) =>{
  req.user.getOrders().then(orders =>{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
