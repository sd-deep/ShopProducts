const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin')

const router = express.Router();


router.get('/', (req, res, next) => {
  const product = adminData.product;
  res.render('shop', {
    prods : product, 
    pageTitle : 'My Shop', 
    path : '/', 
    hasProduct : product.length>0,
    activeShop : true,
    productCSS : true
  })
  /* res.sendFile(path.join(rootDir, 'views', 'shop.html')); */
});

module.exports = router;