const express= require("express");
const router = express.Router()

router.get('/test-me', function ss(req, res) {
    res.send("working")
})

module.exports = router