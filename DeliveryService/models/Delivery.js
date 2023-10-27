const mongoose = require('mongoose')
const DeliverySchema = new mongoose.Schema({
    Order: {
        type: Object,
        required: true
    },
    PaymentOnDelivery: {
        type: Boolean,
        required: true
    },
    EstimatedDeliveryTime:{
        type: Date,
        required: true
    },
    DeliveredBy: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    Delivered: {
        type: Boolean,
        required: true
    }
})

const Delivery = mongoose.model('Delivery', DeliverySchema)
module.exports = Delivery