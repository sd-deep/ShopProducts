const fs = require('fs');
const path = require('path');
const pdfDoc = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require("../models/product");
//const Cart = require('../models/cart');
const Order = require("../models/order");

const ITEM_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  console.log('akahne')
  Product.find()
    .countDocuments()
    .then(numberOfProducts => {
      totalItems = numberOfProducts;
      console.log(totalItems)
      return Product.find() // find is a static function provided by mongoose 
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then(products => {
      console.log('before render')
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
      });
      console.log('after render')
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId) // findByID is a static method provided by moongosse and also it transforms the id to OBjectID of mongdb we dont need to use new mongodb.ObjectId(prodId)
    .then(product => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  console.log('akahne');
  Product.find()
    .countDocuments()
    .then(numberOfProducts => {
      totalItems = numberOfProducts;
      console.log(totalItems)
      return Product.find() // find is a static function provided by mongoose 
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then(products => {
      console.log('before render')
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
      });
      console.log('after render')
    })
    .catch(err => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const cartProducts = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};


exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id }).then(orders => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders
    });
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const cartProducts = user.cart.items.map(i => {
        console.log('inside product details fetching')
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: cartProducts
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};


exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => { 
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      })
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getInvoice = (req, res, next) => {
  console.log('inside getInvoice')
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if (!order) {
      console.log('inside order error')
      return next(new Error('No order found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      console.log('inside user mismatch error')
      return next(new Error('Unauthorized'));
    }
    console.log('in')
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const doc = new pdfDoc();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; fileName="' + invoiceName + '"');
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);

    doc.fontSize(26).text('Invoice', {
      underline: true
    });
    doc.text('-----------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      doc.fontSize(18).text(
        prod.product.title +
        ' - ' +
        prod.quantity +
        'x' +
        'Rs' +
        prod.product.price
      );

    });
    doc.fontSize(26).text('-----------------------------');
    doc.fontSize(20).text('Total Price - Rs' + totalPrice);

    doc.end();

    /* fs.readFile(invoicePath, (err, data) => {
      if (err) {
        return next(err);
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; fileName="' + invoiceName + '"');
      res.send(data);
    }) */
    //const file = fs.createReadStream(invoicePath);
    //file.pipe(res);
  })
    .catch(err => {
      next(err);
    })

}
