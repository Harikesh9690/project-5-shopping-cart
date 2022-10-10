const express = require("express");
const router = express.Router()
const user = require('../controllers/userController')

router.get('/test-me', function ss(req, res) {
    res.send("working")
})

router.post('/register', user.createUser)
router.post('/login', user.loginUser)


router.all("/*", function (req, res) {
    res.status(400).send({
        status: false, message: "Make Sure Your Endpoint is Correct !!!"
    });
});

module.exports = router