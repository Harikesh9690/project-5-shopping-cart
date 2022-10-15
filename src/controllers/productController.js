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

const validField = (name) => {
    return toString(name).toLowerCase().match(/^[a-zA-Z0-9.,-_;: ]+$/)
}

let isValidSize = function (sizes) {
    return ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(sizes);
}

const validPrice = (name) => {
    return (name)
        .match(/^([0-9]{0,15}((.)[0-9]{0,2}))$/)
}


const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length < 1) return res.status(400).send({ status: false, message: "Request Body Can't Be Blank" });
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;


        if (!title || !stringChecking(title)) return res.status(400).send({ status: false, msg: "Title Is A Mandatory Field And Should Be A NonEmpty String Only" });

        let product = await productModel.findOne({ title: title });
        if (product) return res.status(400).send({ status: false, message: "Title Is Already In Use,Please Use Different Title" });


        if (!description || !stringChecking(description)) return res.status(400).send({ status: false, msg: "Description Is A Mandatory Field And Should Be A NonEmpty String Only" });

        if (!price) return res.status(400).send({ status: false, msg: "Price Is A Mandatory Field And Should Be A Number Only" });
        price = Number(price);
        if (!/^[1-9]\d*(\.\d+)?$/.test(price)) return res.status(400).send({ status: false, msg: "Price Should Be A Number Only" });

        if (currencyId && currencyId !== "INR") return res.status(400).send({ status: false, msg: "CurrencyId Should Be 'INR' Only" });
        if (currencyFormat && currencyFormat !== "₹") return res.status(400).send({ status: false, msg: "CurrencyFormat Should Be '₹' Only" });

        if (!isFreeShipping) {
            if (price > 500) {
                data.isFreeShipping = true
            }
        }
        if (isFreeShipping && !["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, msg: "isFreeShipping Should Be True Or False Only" });

        if (style && typeof style !== "string") return res.status(400).send({ status: false, msg: "Style Should Be String Only" });

        let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        if (availableSizes && availableSizes.length > 0) {
            let convertArray = availableSizes.split(",")
            let result = convertArray.filter(x => sizes.includes(x))
            if (result.length !== convertArray.length) {
                return res.status(400).send({ status: false, message: "Available Sizes Must Be Among S, XS, M, X, L, XXL, XL" })
            }
            data.availableSizes = result
        } else {
            return res.status(400).send({ status: false, message: 'plesae provide at least one size' })
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
        return res.status(201).send({ status: true, message: "Success", data: savedProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


let getProducts = async function (req, res) {
    try {
        let data = req.query
        let { name, priceSort, size, priceGreaterThan, priceLessThan, } = data
        if (!validField(name)) { return res.status(400).send({ status: false, message: "Please enter title in correct format" }) }

        if (priceSort) {
            if (!priceSort == -1 || !priceSort == 1) { return res.status(400).send({ status: false, message: "Please enter valid price pricesort" }) }
        } 

        let filter = { isDeleted: false }
        
        if (size) {
            size = size.toUpperCase().split(",")

            for (let i = 0; i < size.length; i++) {
                if (!isValidSize(size[i])) {
                    return res.status(400).send({ status: false, message: "Size shouldbe one of them [S,XS,M,X,XL,XXL]" })
                }
            }
            filter.availableSizes = { $all: size }
        }
        if (name) {
            filter["title"] = { $regex: name }
        }
        if (priceLessThan) {
            if (!validPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }

            filter['price'] = { $lt: priceLessThan }
        }

        if (priceGreaterThan) {

            if (!validPrice(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }

            filter['price'] = { $gt: priceGreaterThan }
        }
        if (priceGreaterThan && priceLessThan) {
            filter['price'] = { $lt: priceLessThan, $gt: priceGreaterThan }
        }

        let finalData = await productModel.find(filter).sort({ price: priceSort })

        if (finalData.length == 0) {
            return res.status(200).send({ status: false, message: "No product available" })
        }

        return res.status(200).send({ status: true, message: "Success", data: finalData })

    } catch (error) {
        return res.status(500).send({ message: error.message });
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

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
  };

const isValidStyle = function (value) {
    return (/^[a-zA-Z _.-]+$/).test(value)
}


const updateProducts = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "This productId is not valid" })
        }

        const existingProduct = await productModel.findById({ _id: productId })
        if (!existingProduct) {
            return res.status(400).send({ status: false, message: "This product is not found" })
        }

        if (existingProduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: "This product has been deleted" })
        }

        let data = req.body
        let files = req.files

        if (!isValid(data) && !isValid(files)) {
            return res.status(400).send({ status: "false", message: "Please enter the data to update" });
        }

        if (data.title) {
            if (!isValid(data.title)) {
                return res.status(400).send({ status: false, message: "Title is not valid" })
            }
        }

        const titleCheck = await productModel.findOne({ title: data.title })
        if (titleCheck) {
            return res.status(400).send({ status: false, message: "This title is already existing" })
        }

        if (data.price) {
            if (!validPrice(data.price)) {
                return res.status(400).send({ status: false, message: "Price is not present in correct format" })
            }
        }


        if (data.isFreeShipping) {
            if (!(data.isFreeShipping == "true" || data.isFreeShipping == "false")) {
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isFreeShipping" })
            }
        }

        if (data.style) {
            if (!isValid(data.style)) {
                return res.status(400).sens({ status: false, message: "Style is not valid" })
            }

            if (!isValidStyle(data.style)) {
                return res.status(400).send({ status: false, message: "Style is not in correct format" })
            }
        }

        if (data.availableSizes) {
            if (data.availableSizes) {
                let size = data.availableSizes.toUpperCase().split(",")
                data.availableSizes = size;
            }
        }//baaki hai

        if (data.installments) {
            if (!(data.installments || typeof data.installments == Number)) {
                return res.status(400).send({ status: false, message: "Installments should in correct format" })
            }
        }

        if (files && files.length > 0) {
            let uploadedFileURL = await awsfile.uploadFile(files[0])
            data.productImage = uploadedFileURL
        }

        const updateProduct = await productModel.findByIdAndUpdate({ _id: productId }, data, { new: true })
        return res.status(200).send({ status: true, message: "Product Updated Successfully", data: updateProduct })

    } catch (error) {
        return res.status(500).send({ status: "false", message: error.message })

    }
}

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid product id" });
        }

        const productById = await productModel.findOne({
            _id: productId,
            isDeleted: false,
            deletedAt: null,
        });

        if (!productById) {
            return res.status(404).send({
                status: false,
                message: "No product found by this product id",
            });
        }

        const mark = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: Date.now() } });

        return res.status(200).send({ status: true, message: "Product successfully deleted" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

module.exports = { createProduct, productByid, getProducts, updateProducts, deleteProduct }