const cartModel = require('../Models/cartModel')
const userModel = require('../Models/userModel')
const productModel = require('../Models/productModel')
const mongoose = require('mongoose')
const { isValid } = require('../validations/validation')

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        if (!userId) {
            return res.status(400).send({ status: false, message: "User Id is required in path params !" })
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "User id is invalid!" })
        }
        let userPresent = await userModel.findOne({ _id: userId, isDeleted: false });
        if (!userPresent) {
            return res.status(404).send({ status: false, message: "No user is present with this id !" });
        }
        data.userId = userId
        if (!isValid(data)) {
            return res.status(400).send({ status: false, message: "You have not provided any data" })
        }
        if (!mongoose.Types.ObjectId.isValid(data.productId)) {
            return res.status(400).send({ status: false, message: "product id is invalid!" })
        }
        let productDetails = await productModel.findOne({ _id: data.productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({ status: false, message: 'product does not exist for this productId' })
        }

        data.totalPrice = productDetails.price
        let savedata = await cartModel.create({data})

        return res.status(201).send({ status: true, data: savedata })
    } catch (error) {
        return res.status(500).send({ status: "false", message: error.message })
    }
}

module.exports = { createCart }