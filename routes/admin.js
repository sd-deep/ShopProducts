const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

const product = [];
// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
  res.render('add-product',{
    pageTitle : 'Add Product', 
    path : '/add-product',
    activeAddProduct : true,
    formsCSS : true,
    productCSS : true})
  /* res.sendFile(path.join(rootDir, 'views', 'add-product.html')); */
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  product.push({title : req.body.title})
  res.redirect('/');
});

module.exports.routes = router;
exports.product = product;
