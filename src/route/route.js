const express = require("express");
const router = express.Router()
const user = require('../controllers/userController')
const product = require('../controllers/productController')
const cart = require('../controllers/cartController')
const order = require('../controllers/orderController')
const mw = require('../middleware/auth')

 
router.post('/register', user.createUser)
router.post('/login', user.loginUser)
router.get('/user/:userId/profile',mw.auth, user.getUserDetails)
router.put('/user/:userId/profile',mw.auth, user.updateProfile)


router.post('/products', product.createProduct)
router.get('/products', product.getProducts)
router.get('/products/:productId', product.productByid)
router.put('/products/:productId', product.updateProducts)
router.delete('/products/:productId', product.deleteProduct)


router.post('/users/:userId/cart',mw.auth, cart.createCart)
router.get('/users/:userId/cart',mw.auth, cart.getCart)
router.put('/users/:userId/cart',mw.auth, cart.updatecart)
router.delete('/users/:userId/cart',mw.auth, cart.deleteCart)


router.post('/users/:userId/orders',mw.auth, order.orderCreate)
router.put('/users/:userId/orders',mw.auth, order.updateOrder)


router.all("/*", function (req, res) {
    res.status(400).send({
        status: false, message: "Make Sure Your Endpoint is Correct !!!"
    });
});

module.exports = router