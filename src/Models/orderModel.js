const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        require: true,
        unique: true
    },
    items: [{
        productId: {
            type: ObjectId,
            ref: 'product',
            require: true
        },
        quantity: {
            type: Number,
            require: true,
            default: 1
        },
        _id: false
    }],
    totalPrice: {
        type: Number,
        require: true
    },
    totalItems: {
        type: Number,
        require: true
    },
    totalQuantity: {
        type: Number,
        require: true
    },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'cancled']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema)