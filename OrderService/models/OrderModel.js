const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
    food: {
        type: Array,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true

    },
    address: {
        type: String,
        required: true
    },
    takeOut:{
        type: Boolean,
        required: true,
        default: false
    },
    paymentOnDelivery:{
        type:Boolean,
        required: true,
        default:false
    },
    user: {
        type: String,
        required: true
    },
    estimatedDeliveryTime: {
        type: String, //if we use date, it gives the data in date format which is not what we want
        required: true
    },
    delivered: {
        type: Boolean,
        default: false,
        required: true
    },
    isCanceled: {
        type: Boolean,
        default: false,
        required: true
    },
    isAssigned: {
        type: Boolean,
        default: false,
        required: true
    },
    assignedTo:{
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Order = mongoose.model('Orders', OrderSchema)
module.exports = Order