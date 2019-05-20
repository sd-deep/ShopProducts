const express = require('express');

const shopController = require('../controllers/shop')


const router = express.Router();

// get route for index page
router.get('/', shopController.getIndex);

// get products => Get
router.get('/products',shopController.getProducts);


router.get('/products/:productId',shopController.getProduct);
// get cart => GET

router.get('/cart',shopController.getCart);

router.post('/cart',shopController.postCart);

router.post('/cart-delete-product', shopController.postDeleteCartProduct);

router.get('/orders',shopController.getOrders);
//get checkout => GET
router.get('/checkout',shopController.getCheckout);


module.exports = router;