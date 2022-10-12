const jwt = require('jsonwebtoken')

const auth = function (req, res, next) {
    try {
        let token = req.headers['authorization']
        if(!token)return res.status(400).send({status: false, error: "please give a Bearer token "})
        if (token.startsWith("Bearer ")) {
            token = token.substring(7, token.length);
        }
        try {
            let decodedtoken = jwt.verify(token, "functionup-plutonium")
            req.pass = decodedtoken;
            next()
        } catch (err) {
            return res.status(401).send({ status: false, message: `${err.message} please check your token` })
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}

module.exports.auth = auth