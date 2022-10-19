const orderModel = require('../Models/orderModel')
const userModel = require('../Models/userModel')
const cartModel = require('../Models/cartModel')
const mongoose = require('mongoose')
const { isValid } = require('../validations/validation')


const orderCreate = async function (req, res) {
    try {
        let userId = req.params.userId
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
        let data = req.body
        if (!isValid(data.cartId)) {
            return res.status(400).send({ status: false, message: 'please provide cartId' })
        }
        if (!mongoose.Types.ObjectId.isValid(data.cartId)) {
            return res.status(400).send({ status: false, message: "cart id is invalid!" })
        }
        if (data.cancellable) {
            if (data.cancellable !== Boolean) {
                return res.status(400).send({ status: false, message: "cancellable contains only 'true' and 'false'" })
            }
        }
        let cartDetailes = await cartModel.findById({ _id: data.cartId })
        if (!cartDetailes) {
            return res.status(404).send({ status: false, message: "cart is not present for this id !!" })
        }
        if (cartDetailes.userId.toString() != userId) {
            return res.status(403).send({ status: false, message: "please give your own cart id !!" })
        }
        cartDetailes = cartDetailes.toObject()

        let cartItems = cartDetailes.items
        if (cartItems.length == 0) {
            return res.status(400).send({ status: false, message: "you have no items in cart" })
        }
        let totalQuantity = 0
        for (let i = 0; i < cartItems.length; i++) {
            totalQuantity += cartItems[i].quantity
        }

        let orderData = {
            userId: cartDetailes.userId.toString(),
            items: cartDetailes.items,
            totalPrice: cartDetailes.totalPrice,
            totalItems: cartDetailes.totalItems,
            totalQuantity: totalQuantity,
            cancellable: data.cancellable
        }
      
        let savedata = await orderModel.create(orderData)
        if (savedata) {
            let forupdate = {
                items: [],
                totalPrice: 0,
                totalItems: 0
            }
            await cartModel.findOneAndUpdate(
                { userId: userId },
                 forupdate,
                { new: true }
            );
        }
        return res.status(201).send({status: true,message: 'Success', data: savedata})
    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message });
    }
}

const updateOrder = async function(req, res){
    let userId = req.params.userId
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
        let data = req.body
        if (!isValid(data.orderId)) {
            return res.status(400).send({ status: false, message: 'please provide orderid' })
        }
        if (!mongoose.Types.ObjectId.isValid(data.orderId)) {
            return res.status(400).send({ status: false, message: "orderId id is invalid!" })
        }
        let orderDetails = await orderModel.findById({_id: data.orderId})
        if (!orderDetails) {
            return res.status(400).send({ status: false, message: "you have no any order for this order id !!" })
        }
        if (orderDetails.userId.toString() !== userId) {
            return res.status(400).send({ status: false, message: "this order Id is not yours" })
        }
        if (orderDetails.cancellable === false) {
            return res.status(400).send({ status: false, message: "you" })
        }
}

module.exports = { orderCreate, updateOrder }