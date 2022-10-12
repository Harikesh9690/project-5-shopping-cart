const mongoose = require('mongoose')

const productschema=new mongoose.Schema({ 
    title: {type:String, require:true, unique:true},
    description: {type:String, require:true},
    price: {type:Number, require:true} ,//valid number/decimal//},
    currencyId: {type:String, require:true,enum:['INR'],default:'INR' },
    currencyFormat: {type:String, require:true,enum:['₹'],default:'₹' },
    isFreeShipping: {type:Boolean, require:true, },
    productImage: {type:String, require:true, },  // s3 link
    style:String,
    availableSizes: [{type:String,require:true, enum:["S","XS","M","X","L","XXL","XL"]}],
    installments: Number,
    deletedAt:Date,
    isDeleted: {type:Boolean, default: false},
  },{timestamp:true})

  module.exports = mongoose.model('product', productschema)