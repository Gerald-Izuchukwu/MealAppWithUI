const Delivery = require('../models/Delivery')
const amqp = require('amqplib')
const amqpServer = process.env.RABBITMQ_CONNECTION_STRING

const rabbitConnect = async()=>{
    try {
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel()
        channel.assertQueue('DELIVERY')
        return channel
    } catch (error) {
        console.log(error)
    }
}

const getPendingOrder = async(req, res)=>{
    try {
        const pendingOrder = await Delivery.find({"Order.delivered" : false, "Order.isCanceled" : false})
        if(!pendingOrder){
            console.log('No pending order at the moment')
            return res.status(400).send("No Pending Order at the moment")
        }
        console.log(req.user)
        return res.status(200).json({msg: "Here are the pending orders", pendingOrder})
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Error ' + error.message)
    }
}

const acceptToDeliverOrder = async(req, res)=>{
    try {
        const email = req.user.email
        const id = req.params.id
        const order = await Delivery.findById(id)
        if(!order){
            console.log('No order found or order might have been deleted')
            return res.status(400).send('No order found or order might have been deleted')
        }
        const body = {

            "Order.isAssigned": true,
            "Order.assignedTo": email,
            "DeliveredBy": email,

        }
        const updatedOrder = await Delivery.findByIdAndUpdate(id, {$set: body}, {new: true} )
        console.log('Order assigned to be delivered')
        return res.status(200).send('Order has been assigned to you. Deliver ASAP!')
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error ' + error.message)
    }

}

const deliverOrder = async(req, res)=>{
    try {
        rabbitConnect().then((channel)=>{
            channel.consume("DELIVERY", (data)=>{
                console.log('Consuming from DELIVERY queue');
                const {order} = JSON.parse(data.content)
                const {paymentOnDelivery,estimatedDeliveryTime, assignedTo, delivered,  address} = order
                const delivery = {
                    Order : order, 
                    PaymentOnDelivery: paymentOnDelivery,
                    EstimatedDeliveryTime: estimatedDeliveryTime,
                    DeliveredBy: assignedTo,
                    Address: address,
                    Delivered: delivered
                }
                Delivery.create(delivery)
                console.log('Delivery Saved to Database')
                channel.ack(data)
            })
            setTimeout(()=>{
                channel.close()
            }, 4000)
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

const deliveryComplete = async(req, res)=>{
    try {
        const email = req.user.email
        const id = req.params.id
        const order = await Delivery.findById(id)
        if(!order){
            console.log('No order found or order might have been deleted')
            return res.status(400).send('No order found or order might have been deleted')
        }
        if(order.DeliveredBy !== email){
            console.log('You cant complete this order since it wasnt assigned to you')
            return res.status(400).send('You cant complete this order since it wasnt assigned to you')
        }
        const body = {
            "Order.delivered": true,
            "Delivered": true
        }
        const completedOrder = await Delivery.findByIdAndUpdate(id, {$set: body}, {new: true})
        return res.status(200).send('Order Successfully Delivered' + completedOrder)
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

module.exports = { getPendingOrder, deliverOrder, deliveryComplete, acceptToDeliverOrder}