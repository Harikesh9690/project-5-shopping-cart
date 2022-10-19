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
        let cartbyUserId = await cartModel.findOne({ userId: userId, isDeleted: false });
        if (!cartbyUserId) {
            data.totalPrice = productDetails.price
            data.totalItems = 1
            data.items = [{
                productId: data.productId
            }]
            let savedata = await cartModel.create(data)

            return res.status(201).send({ status: true, data: savedata })
        }
        if (!data.cartId) {
            return res.status(400).send({ status: false, message: 'Cart Id is required in body !' })
        }
        if (!mongoose.Types.ObjectId.isValid(data.cartId)) {
            return res.status(400).send({ status: false, message: "cart id is invalid!" })
        }

        let cartDetailes = await cartModel.findById(data.cartId)
        if (!cartDetailes) {
            return res.status(404).send({ status: false, message: "cart is not present for this id !!" })
        }
        if (cartDetailes.userId.toString() != userId) {
            return res.status(403).send({ status: false, message: "please give your own cart id !!" })
        }

        cartDetailes = cartDetailes.toObject()
        let cartItems = cartDetailes.items


        for (let i = 0; i < cartItems.length; i++) {
            if (data.productId === cartItems[i].productId.toString()) {
                cartItems[i].quantity = cartItems[i].quantity + 1
                cartDetailes.totalPrice = productDetails.price + cartDetailes.totalPrice
                let savedata = await cartModel.findOneAndUpdate({ _id: data.cartId }, cartDetailes, { new: true }).select({__v: 0})
                return res.status(201).send({ status: true, data: savedata })
            }
        }


        cartDetailes.totalItems = cartDetailes.totalItems + 1
        cartDetailes.totalPrice = productDetails.price + cartDetailes.totalPrice
        cartDetailes.items = [{
            productId: data.productId,
            quantity: 1
        }]

        let savedata = await cartModel.findOneAndUpdate(
            { _id: data.cartId },
            { $set: { totalItems: cartDetailes.totalItems, totalPrice: cartDetailes.totalPrice }, $push: { items: cartDetailes.items } },
            { new: true }).select({__v: 0})
        return res.status(201).send({ status: true, data: savedata })

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "false", message: error.message })
    }
}

const updatecart = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let { productId, cartId, removeProduct } = data


        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId!" })
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: 'enter a valid userId in params' })
        let userPresent = await userModel.findOne({ _id: userId, isDeleted: false });
        if (!userPresent) {
            return res.status(404).send({ status: false, message: "No user is present with this id !" });
        }
        if (removeProduct) {
            if (!(removeProduct == 1 || removeProduct == 0)) return res.status(400).send({ status: false, message: "please mention 1 or 0 only in remove product" })
        }


        if (!cartId) return res.status(400).send({ status: false, message: "Please provide cardId!" })
        if (!mongoose.Types.ObjectId.isValid(cartId)) return res.status(400).send({ status: false, msg: 'enter a valid cartId' })

        let cartExsits = await cartModel.findById({ _id: cartId })
        if (!cartExsits) return res.status(404).send({ status: false, message: " Cart ID does not exists" })

        let cartItems = cartExsits.items

        if (cartExsits.userId.toString() !== userId) return res.status(403).send({ status: false, msg: "cart doesnot belongs to you" })
        if (cartItems.length == 0) { return res.status(400).send({ status: false, message: "Nothing left to update" }) }


        if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, msg: 'enter a valid productId' })
        let productExsits = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExsits) return res.status(404).send({ status: false, msg: 'no product found' })

        let productCheck = cartItems.findIndex(element => element.productId == productId);
        if (productCheck == -1) return res.status(404).send({ status: false, msg: "given product is not found in the cart" })
        let quantity = cartItems[productCheck].quantity;


        if (removeProduct == 0) {
            let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -quantity * productExsits.price } }, { new: true })
            return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })
        }
        if (removeProduct == 1) {
            let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -productExsits.price } }, { new: true })
            return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })
        }

        cartItems[productCheck].quantity -= 1;
        let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { items: cartItems, $inc: { totalPrice: -productExsits.price } }, { new: true })
        return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

const getCart = async function (req, res) {
    try {
        let reqUserId = req.params.userId;
        if (!reqUserId) {
            return res.status(400).send({ status: false, message: "userId is required path params " });
        }
        if (!mongoose.Types.ObjectId.isValid(reqUserId)) {
            return res.status(400).send({ status: false, message: "User id is invalid!" });
        }

        let isValid = await userModel.findOne({ _id: reqUserId });
        if (!isValid) {
            return res.status(404).send({ status: false, message: "No User with this given userId. please give a valid user id" });
        }
        //Authentication
        // if (req.pass.userId !== reqUserId) {
        //     return res.status(403).send({ status: false, msg: "you are not authorised !!" })
        //   }

        let cart = await cartModel.findOne({ userId: isValid._id }).populate([{ path: "items.productId", select: { title: 1, productImage: 1, price: 1, isFreeShipping: 1 } }])
        if (!cart) {
            return res.status(404).send({ status: false, message: "Empty Cart." });
        }

        return res.status(200).send({ status: true, message: "successful", data: cart });
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message });
    }
};

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId" });
        }
        let findUser = await userModel.findById({ _id: userId });
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User not found" });
        }
        let cartDetailes = await cartModel.findOne({ userId: userId })
        if (!cartDetailes) {
            return res.status(404).send({ status: false, message: "cart not found for this userid" });
        }
        //Authentication
        // if (req.pass.userId !== userId) {
        //     return res.status(403).send({ status: false, msg: "you are not authorised !!" })
        //   }
        let forupdate = {
            items: [],
            totalPrice: 0,
            totalItems: 0
        }
        let cartGet = await cartModel.findOneAndUpdate(
            { userId: userId },
             forupdate,
            { new: true }
        );
        return res.status(204).send({ status: true, message: 'deleted successfully', data: cartGet })
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = { createCart, updatecart, getCart, deleteCart }