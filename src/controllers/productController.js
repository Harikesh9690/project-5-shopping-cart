const productModel = require('../Models/productModel')
const mongoose = require('mongoose')
const awsfile = require('../aws/aws')

const stringChecking = function (data) {
    if (typeof data !== 'string') {
        return false;
    } else if (typeof data === 'string' && data.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}

// const createProduct = async function (req, res) {
//     try {
//         const data = req.body;
//         if (Object.keys(data).length < 1) return res.status(400).send({ status: false, message: "Request Body Can't Be Blank" });
//         let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, deletedAt, isDeleted } = data;


//         if (!title || !stringChecking(title)) return res.status(400).send({ status: false, msg: "Title Is A Mandatory Field And Should Be A NonEmpty String Only" });

//         let product = await productModel.findOne({ title: title });
//         if (product) return res.status(400).send({ status: false, message: "Title Is Already In Use,Please Use Different Title" });


//         if (!description || !stringChecking(description)) return res.status(400).send({ status: false, msg: "Description Is A Mandatory Field And Should Be A NonEmpty String Only" });

//         if (!price) return res.status(400).send({ status: false, msg: "Price Is A Mandatory Field And Should Be A Number Only" });
//         price = Number(price);
//         if (!/^[1-9]\d*(\.\d+)?$/.test(price)) return res.status(400).send({ status: false, msg: "Price Should Be A Number Only" });
//         if (currencyId && currencyId !== "INR") return res.status(400).send({ status: false, msg: "CurrencyId Should Be INR Only" });
//         else data.currencyId = "INR";
//         if (currencyFormat && currencyFormat !== "₹") return res.status(400).send({ status: false, msg: "CurrencyFormat Should Be ₹ Only" });
//         else data.currencyFormat = "₹";

//         if (isFreeShipping && !["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, msg: "isFreeShipping Should Be True Or False Only" });


//         let files = req.files
//         if (files && files.length > 0) {
//             let uploadedFileURL = await uploadFile(files[0])
//             data.productImage = uploadedFileURL
//         }
//         else {
//             return res.status(400).send({ msg: "Please Provide A product Image" });
//         }
//         if (style && typeof style !== "string") return res.status(400).send({ status: false, msg: "Style Should Be String Only" });

//         let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
//         if (availableSizes && availableSizes.length > 0) {
//             let result = availableSizes.filter(x => sizes.includes(x))
//             if (result.length !== availableSizes.length) return res.status(400).send({ status: false, message: "Available Sizes Must Be Among S, XS, M, X, L, XXL, XL" })

//         }
//         if (installments && !/^[0-9]*$/.test(installments)) return res.status(400).send({ status: false, msg: "Installments Should Be A Number Only" });
//         if (isDeleted && !["true", "false"].includes(isDeleted)) return res.status(400).send({ status: false, msg: "isDeleted Should Be True Or False Only" });


//         let savedProduct = await productModel.create(data);
//         return res.status(201).send({ status: true, message: "success", data: savedProduct })
//     }
//     catch (error) {
//         return res.status(500).send({ status: false, message: error.message })
//     }
// }


const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length < 1) return res.status(400).send({ status: false, message: "Request Body Can't Be Blank" });
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data;


        if (!title || !stringChecking(title)) return res.status(400).send({ status: false, msg: "Title Is A Mandatory Field And Should Be A NonEmpty String Only" });

        let product = await productModel.findOne({ title: title });
        if (product) return res.status(400).send({ status: false, message: "Title Is Already In Use,Please Use Different Title" });


        if (!description || !stringChecking(description)) return res.status(400).send({ status: false, msg: "Description Is A Mandatory Field And Should Be A NonEmpty String Only" });

        if (!price) return res.status(400).send({ status: false, msg: "Price Is A Mandatory Field And Should Be A Number Only" });
        price = Number(price);
        if (!/^[1-9]\d*(\.\d+)?$/.test(price)) return res.status(400).send({ status: false, msg: "Price Should Be A Number Only" });
        if (currencyId && currencyId !== "INR") return res.status(400).send({ status: false, msg: "CurrencyId Should Be 'INR' Only" });

        if (currencyFormat && currencyFormat !== "₹") return res.status(400).send({ status: false, msg: "CurrencyFormat Should Be '₹' Only" });


        if (isFreeShipping && !["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, msg: "isFreeShipping Should Be True Or False Only" });

        if (style && typeof style !== "string") return res.status(400).send({ status: false, msg: "Style Should Be String Only" });

        let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        if (availableSizes && availableSizes.length > 0) {
            console.log(availableSizes.split(",").length );
            let result = availableSizes.split(",").filter(x => sizes.includes(x))
            console.log(result.length);
            if (result.length == availableSizes.length) return res.status(400).send({ status: false, message: "Available Sizes Must Be Among S, XS, M, X, L, XXL, XL" })//baki hai
        }else{
            return res.status(400).send({ status: false, message: 'plesae provide size at least one'})
        }

        if (installments && !/^[0-9]*$/.test(installments)) return res.status(400).send({ status: false, msg: "Installments Should Be A Number Only" });

        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await awsfile.uploadFile(files[0])
            data.productImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ msg: "Please Provide A product Image" });
        }

        let savedProduct = await productModel.create(data);
        return res.status(201).send({ status: true, message: "success", data: savedProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

let getProducts = async function (req, res) {
    try {
        let data = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

        let filter = { isDeleted: false }

        if (size) {
            let sizeArray = size.trim().split(",").map((s) => s.trim())
            filter.availableSizes = { $all: sizeArray }
        }//baki hai

        if (name) {
            filter.title = name.trim()
        }//baki hai

        if (priceGreaterThan) {
            filter.price = { $gt: priceGreaterThan }
        }

        if (priceLessThan) {
            filter.price = { $lt: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {
            filter.price = { $gte: priceGreaterThan, $lte: priceLessThan }
        }

        let productList = await productModel.find(filter).sort({ price: priceSort })
        let count=await  productModel.find(filter).count()

        if (productList.length == 0) return res.status(404).send({ status: false, message: "No products available." })

        return res.status(200).send({ status: true, message: "product Lists",count:count, data: productList })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const productByid = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "Product id is invalid!" })
        }
        let product = await productModel.findOne({
            _id: productId,
            isDeleted: false,
        });
        if (!product)
            return res.status(404).send({
                status: false,
                message: "No products found or product has been deleted",
            });
        res.status(200).send({ status: true, message: "Success", data: product });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createProduct, productByid, getProducts }