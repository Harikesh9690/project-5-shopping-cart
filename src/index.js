const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const multer = require('multer')
const route = require('./route/route.js')
const app = express();


app.use(bodyParser.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://projects94:E35tUpfux9D87GOj@cluster0.m1ousdd.mongodb.net/group12Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen(process.env.PORT || 3000, () => { console.log('Express app running on port ' + (process.env.PORT || 3000))})