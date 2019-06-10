const express = require('express');

const isAuth = require('../middleware/is-auth')

const { check } = require('express-validator/check')

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, [
    check('title', 'Invalid Title').isLength({min : 5 , max : 100}).isString().trim(),    
    check('price').isFloat().withMessage('invalid price'),
    check('description', 'Description must be between 5 - 200 characters').isLength({min : 5, max : 200}).trim()
], adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth,  adminController.getEditProduct);

router.post('/edit-product', isAuth, [
    check('title', 'Invalid Title').isLength({min : 5 , max : 100}).isString().trim(),
    check('price').isFloat().withMessage('invalid price'),
    check('description', 'Description must be between 5 - 200 characters').isLength({min : 5, max : 200}).trim()
], adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
