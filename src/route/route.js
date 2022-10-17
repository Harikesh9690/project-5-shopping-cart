const express = require("express");
const router = express.Router()
const user = require('../controllers/userController')
const product = require('../controllers/productController')
const cart = require('../controllers/cartController')
const mw = require('../middleware/auth')

router.get('/test-me', function ss(req, res) {
    res.send("working")
})

router.post('/register', user.createUser)
router.post('/login', user.loginUser)
router.get('/user/:userId/profile',mw.auth, user.getUserDetails)
router.put('/user/:userId/profile',mw.auth, user.updateProfile)


router.post('/products', product.createProduct)
router.get('/products', product.getProducts)
router.get('/products/:productId', product.productByid)
router.put('/products/:productId', product.updateProducts)
router.delete('/products/:productId', product.deleteProduct)


router.post('/users/:userId/cart', cart.createCart)

router.all("/*", function (req, res) {
    res.status(400).send({
        status: false, message: "Make Sure Your Endpoint is Correct !!!"
    });
});

module.exports = router