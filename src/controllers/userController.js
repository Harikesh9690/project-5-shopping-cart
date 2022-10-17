const userModel = require('../Models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const awsfile = require('../aws/aws')
const {isValid, isvalidemail, isvalidpassword, isvalidmobileNumber} = require('../validations/validation')


const createUser = async function (req, res) {
  try {
    let data = req.body
    let file = req.files
    let { fname, lname, phone, email, password } = data

    if (!isValid(data)) {
      return res.status(400).send({ status: false, message: "You have not provided any data" })
    }
    if (!isValid(fname)) {
      return res.status(400).send({ status: false, message: "Please provide fname. it's mandatory" })
    } else {
       data.fname = fname.replace(/\s+/g, '')
    }
    if (!isValid(lname)) {
      return res.status(400).send({ status: false, message: "Please provide lname. it's mandatory" })
    } else {
      data.lname = lname.replace(/\s+/g, '')
    }
    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "Please provide email" })
    }
    if (!isvalidemail(email)) {
      return res.status(400).send({ status: false, message: "Enter valid email" })
    }
    let usersemail = await userModel.findOne({ email: email })
    if (usersemail) {
      return res.status(400).send({ status: false, message: "this email is already exist" })
    }
    if (!phone) {
      return res.status(400).send({ status: false, message: "Please provide Mobile Number. it's mandatory" })
    }
    if (!isvalidmobileNumber(phone)) {
      return res.status(400).send({ status: false, message: "please provide valid mobile Number 10-digit" })
    }
    let usersphone = await userModel.findOne({ phone: phone })
    if (usersphone) {
      return res.status(400).send({ status: false, message: "this mobile Number is already exist" })
    }
    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Please provide password" })
    }
    if (!isvalidpassword(password)) {
      return res.status(400).send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
    }
    const salt = await bcrypt.genSalt(12)
    data.password = await bcrypt.hash(password, salt)

    data.address = JSON.parse(data.address)
    if (isValid(data.address)) {
      if (isValid(data.address.shipping)) {
        if (!isValid(data.address.shipping.street)) {
          return res.status(400).send({ status: false, message: "Please provide street for shipping address. it's mandatory" })
        } else {
          data.address.shipping.street = data.address.shipping.street.trim().split(" ").filter(word => word).join(" ")
        }
        if (!isValid(data.address.shipping.city)) {
          return res.status(400).send({ status: false, message: "Please provide city name for shipping address. it's mandatory" })
        }
        if (!/^[a-zA-Z][a-zA-Z\\s]+$/.test(data.address.shipping.city)) {
          return res.status(400).send({ status: false, message: "you can not give a number in city name" })
        }
        if (!isValid(data.address.shipping.pincode)) {
          return res.status(400).send({ status: false, message: "Please provide pincode for shipping address. it's mandatory" })
        }
        if (!/^[1-9]\d{5}$/.test(data.address.shipping.pincode)) {
          return res.status(400).send({ status: false, message: "please valid pincode in shipping address" })
        }
      } else {
        return res.status(400).send({ status: false, message: "Please provide shipping address. it's mandatory" })
      }
      if (isValid(data.address.billing)) {
        if (!isValid(data.address.billing.street)) {
          return res.status(400).send({ status: false, message: "Please provide street for billing address. it's mandatory" })
        } else {
          data.address.billing.street = data.address.billing.street.trim().split(" ").filter(word => word).join(" ")
        }
        if (!isValid(data.address.billing.city)) {
          return res.status(400).send({ status: false, message: "Please provide city name for billing address. it's mandatory" })
        }
        if (!/^[a-zA-Z][a-zA-Z\\s]+$/.test(data.address.billing.city)) {
          return res.status(400).send({ status: false, message: "you can not give a number in city name" })
        }
        if (!isValid(data.address.billing.pincode)) {
          return res.status(400).send({ status: false, message: "Please provide pincode for billing address. it's mandatory" })
        }
        if (!/^[1-9]\d{5}$/.test(data.address.billing.pincode)) {
          return res.status(400).send({ status: false, message: "please valid pincode in billing address" })
        }
      } else {
        return res.status(400).send({ status: false, message: "Please provide billing address. it's mandatory" })
      }
    } else {
      return res.status(400).send({ status: false, message: "Please provide address" })
    }
    if (file && file.length > 0) {
      let fileupload = await awsfile.uploadFile(file[0])
      data.profileImage = fileupload
    } else {
     return res.status(400).send({ status: false, message: "Please provide profileImage. it's mandatory" })
    }
    let savedata = await userModel.create(data)
    return res.status(201).send({ status: true, message: 'User created successfully', data: savedata })
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message })
  }
}

const loginUser = async function (req, res) {
  try {
    let data = req.body
    let userName = data.email;
    let password = data.password;

    //if give nothing inside req.body
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "Please provide email & password to login." });
    }
    if (Object.keys(data).length > 2) {
      return res.status(400).send({ status: false, message: "Only email & password is required." });
    }
    //---------------------------------------------//
    //if no Email inside req.
    if (!userName) {
      return res.status(400).send({ status: false, message: "please provide an Email !" });
    }
    //if no password inside req.body
    if (!password) {
      return res.status(400).send({ status: false, message: "please enter password !" });
    }
    if (!isvalidpassword(password)) {
      return res.status(400).send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
    }
    //-------------------------------------//

    //if not user
    let userdetails = await userModel.findOne({ email: userName.trim() });
    if (userdetails) {
      let validpassword = await bcrypt.compare(password.trim(), userdetails.password)
      if (!validpassword) {
        return res.status(401).send({ status: false, message: "Emaild or the password is not correct" });
      }
    } else {
      return res.status(401).send({ status: false, message: "Emaild or the password is not correct" });
    }
    //success creation starting

    let token = jwt.sign(
      {
        userId: userdetails._id.toString(),
        batch: "project5",
        organisation: "group12",
      },
      "functionup-plutonium",
      { expiresIn: "24h" }, { iat: Date.now() }
    );
    let resp = {
      userId: userdetails._id.toString(),
      token: token
    }
    res.status(200).send({ status: true, message: "User login successfull", data: resp });
  } catch (err) {
    res.status(500).send({ message: "server error", error: err });
  }
};

const getUserDetails = async function (req, res) {

  try {
    let userId = req.params.userId
    if (!userId) {
      return res.status(400).send({ status: false, message: "User Id is required in path params !" })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ status: false, message: "User id is invalid!" })
    }

    let userPresent = await userModel.findOne({ _id: userId });
    if (!userPresent) {
      return res.status(404).send({status: false, message: "No user is present with this id !"});
    }
    // review alike
    const { fname, lname, phone, email, password, address, profileImage, _id, createdAt, updatedAt, __v } = userPresent
    const data = {
      address: address,
      _id: _id,
      fname: fname,
      lname: lname,
      email: email,
      profileImage: profileImage,
      phone: phone,
      password: password,
      createdAt: createdAt,
      updatedAt: updatedAt,
      __v: __v
    }
    return res.status(200).send({ status: true, message: "User profile details", data: data })
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

const updateProfile = async function (req, res) {
  try {
    let userId = req.params.userId
    
    if (!userId) {
      return res.status(400).send({ status: false, message: "User Id is required in path params !" })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ Status: false, message: "Please enter valid userId" })
    }
    let DetailsWithUserId = await userModel.findById({ _id: userId })
    if (!DetailsWithUserId) {
      return res.status(404).send({ status: false, message: "USER IS NOT FOUND FOR THIS ID" })
    }
    if (req.pass.userId !== userId) {
      return res.status(403).send({ status: false, msg: "you are not authorised !!" })
    }

    let data = req.body
    let file = req.files
    
    if (!isValid(data) && !isValid(file)) {
      return res.status(400).send({ status: false, msg: "request body is empty" });
    }
    if (data.fname) {
      data.fname = data.fname.replace(/\s+/g, '')
    }
    if (data.lname) {
      data.lname = data.lname.replace(/\s+/g, '')
    }
    if (data.email) {
      if (!isvalidemail(data.email)) {
        return res.status(400).send({ status: false, message: "Enter valid email" })
      }
      let usersemail = await userModel.findOne({ email: data.email })
      if (usersemail) {
        return res.status(400).send({ status: false, message: "this email is already exist" })
      }
    }
    if (data.phone) {
      if (!isvalidmobileNumber(data.phone)) {
        return res.status(400).send({ status: false, message: "please provide valid mobile Number 10-digit" })
      }
      let usersphone = await userModel.findOne({ phone: data.phone })
      if (usersphone) {
        return res.status(400).send({ status: false, message: "this mobile Number is already exist" })
      }
    }
    if (data.password) {
      if (!isvalidpassword(data.password)) {
        return res.status(400).send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
      }
      const salt = await bcrypt.genSalt(12)
      data.password = await bcrypt.hash(data.password, salt)
    }
  
  
    if (data.address) {
       data.address  = JSON.parse(data.address)
      if (data.address.shipping) {
        if (data.address.shipping.street) {
          data.address.shipping.street = data.address.shipping.street.trim().split(" ").filter(word => word).join(" ")
        }
        if (data.address.shipping.city) {
          if (!/^[a-zA-Z][a-zA-Z\\s]+$/.test(data.address.shipping.city)) {
            return res.status(400).send({ status: false, message: "you can not give a number in city name" })
          }
          data.address.shipping.city = data.address.shipping.city
        }
        if (data.address.shipping.pincode) {
          if (!/^[1-9]\d{5}$/.test(data.address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "please valid pincode" })
          }
          data.address.shipping.pincode = data.address.shipping.pincode
        }
      }
      if (data.address.billing) {
        if (data.address.billing.street) {
          data.address.billing.street = data.address.billing.street.trim().split(" ").filter(word => word).join(" ")
        }
        if (data.address.billing.city) {
          if (!/^[a-zA-Z][a-zA-Z\\s]+$/.test(data.address.billing.city)) {
            return res.status(400).send({ status: false, message: "you can not give a number in city name" })
          }
          data.address.billing.city = data.address.billing.city
        }
        if (data.address.billing.pincode) {
          if (!/^[1-9]\d{5}$/.test(data.address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "please valid pincode" })
          }
          data.address.billing.pincode = data.address.billing.pincode
        }
      }
    }

    
    if (file && file.length > 0) {
      let fileupload = await awsfile.uploadFile(file[0])
      data.profileImage = fileupload
    }

    let updated = await userModel.findByIdAndUpdate(
      { _id: userId },
      { $set: data},
      { new: true }
    );
    return res.status(200).send({ status: true, message: "update sucsessfully", data: updated });
  }
  catch (err) {
    res.status(500).send({ message: "server error", error: err.message });
  }
}
module.exports = { createUser, loginUser, getUserDetails, updateProfile }






