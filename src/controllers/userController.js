const userModel = require('../Models/userModel')
const awsfile = require('../aws/aws')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
};

const createUser =async function(req, res){
    try {
        let data = req.body
        const {fname,lname, phone, email, password, address, profileImage } = data
        let passValid = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
        let emailValid = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        let mobileValid = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/
         
        if (!isValid(data)) {
            return res.status(400).send({ status: false, message: "You have not provided any data" })
        }
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide name. it's mandatory" })
        } else {
            data.name = data.name.trim().split(" ").filter(word => word).join(" ")
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide name. it's mandatory" })
        } else {
            data.name = data.name.trim().split(" ").filter(word => word).join(" ")
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide email" })
        }
        if (!emailValid.test(email)) {
            return res.status(400).send({ status: false, message: "Enter valid email" })
        }
        let usersemail = await userModel.findOne({ email: email })
        if (usersemail) {
            return res.status(400).send({ status: false, message: "this email is already exist" })
        }
        if (!isValid(profileImage)) {
            return res.status(400).send({ status: false, message: "Please provide profileImage" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide Mobile Number. it's mandatory" })
        }
        if (!mobileValid.test(phone)) {
            return res.status(400).send({ status: false, message: "please provide valid mobile Number 10-digit" })
        }
        let usersphone = await userModel.findOne({ phone: phone })
        if (usersphone) {
            return res.status(400).send({ status: false, message: "this mobile Number is already exist" })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "Please provide password" })
        }
        if (!passValid.test(password)) {
            return res.send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
        }
        if (address.street) {
            address.street = address.street.trim().split(" ").filter(word => word).join(" ")
        }

        let savedata = await userModel.create(data)
        return res.status(201).send({ status: true,message: 'Success', data: savedata })
    } catch (err) {
       return res.status(500).send({ status: false, err: err.message })
    }
}

const loginUser = async function (req, res) {
    try {
      let userName = req.body.email;
      let password = req.body.password;
  
      //if give nothing inside req.body
      if (Object.keys(data).length == 0) {
        return res.status(400).send({
          status: false,
          message: "Please provide email & password to login.",
        });
      }
      if (Object.keys(data).length > 2) {
        return res
          .status(400)
          .send({ status: false, message: "Only email & password is required." });
      }
      //---------------------------------------------//
      //if no Email inside req.
      if (!userName) {
        return res
          .status(400)
          .send({ status: false, message: "please provide an Email !" });
      }
      //if no password inside req.body
      if (!password) {
        return res
          .status(400)
          .send({ status: false, message: "please enter password !" });
      }
      //-------------------------------------//
  
      //if not user
      let user = await userModel.findOne({ email: userName });
      if (!user) {
        return res
          .status(400)
          .send({ status: false, message: "username is not corerct" });
      }
      //if password not correct
      let pass = await userModel.findOne({ password: password });
      if (!pass) {
        return res
          .status(400)
          .send({ status: false, message: "password is not corerct" });
      }
      //---------------------//
      //success creation starting
  
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          batch: "project5",
          organisation: "group12",
        },
        "functionup-plutonium",
        { expiresIn: "24h" },{iat: Date.now()}
      );
        let resp={
          userId:user._id.toString(),
          token:token,
          expiry: "24 hour",  
          
        }
      res.status(200).send({ status: true, message: "Success", data: resp });
    } catch (err) {
      res.status(500).send({ message: "server error", error: err });
    }
  };

module.exports = {createUser, loginUser}