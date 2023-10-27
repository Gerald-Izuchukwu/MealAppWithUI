const Order = require('../models/OrderModel')
const rabbitConnect = require('../rabbitConnect')
const axios = require('axios').default

const calcDeliveryTime = (timestamp, hoursToAdd, minutesToAdd)=>{
    const newDate = new Date(timestamp)
    newDate.setHours(newDate.getHours() + hoursToAdd);
    newDate.setMinutes(newDate.getMinutes() + minutesToAdd);
    const dateAndTime = newDate.toISOString().split('.')[0]
    return dateAndTime.split('T').join(' ')
}


// place order from already sampled food ----incomplete route
const placeOrder = async(req, res)=>{
    try {
        const orderArray = []
        await rabbitConnect().then((channel)=>{
            channel.consume("ORDER", data=>{
                // const {food, timestamp} = JSON.parse(data.content.dataToSend)
                const {dataToSend} = JSON.parse(data.content)
                const {food, timestamp} = dataToSend
                const user = req.body.user
                const estimatedDeliveryTime = calcDeliveryTime(timestamp, 1, 45)
                console.log(estimatedDeliveryTime)
                console.log('Consuming ORDER Queue')
                let totalPrice = 0
                for(let i=0; i<food.length; i++){
                    totalPrice += food[i].price
                }
                const order = {
                    food,
                    address : "userAddress", //correct this later to be the main user add
                    user, 
                    takeOut: true,
                    paymentOnDelivery: false,
                    totalPrice,
                    estimatedDeliveryTime : estimatedDeliveryTime.toString(),
                    delivered: false,
                    isCanceled: false,
                    isAssigned: false,
                    assignedTo: 'none'
                }
                orderArray.push(order)
                Order.create(order).then((data)=>{ 
                    console.log('Sending to PRODUCT Queue');
                    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({data})))
                })

                channel.ack(data)
            })
            
            setTimeout(()=>{
                channel.close()
            }, 2000)
        })
        await rabbitConnect().then((channel)=>{
            const order = orderArray[0]
            channel.sendToQueue('DELIVERY', Buffer.from(JSON.stringify({order})))
            console.log('Sending To DELIVERY queue')
        }).then(()=>{
            axios.post("http://deliveryservice:9603/meal-api/v1/delivery/deliverOrder")
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    
    }
}


const getOrders = async(req, res)=>{
    try {
        const email = req.user.email
        const orders = await Order.find({user: email})
        if(!orders){
            console.log('No orders found');
            return res.status(400).send('We couldnt find any order')
        }
        return res.status(200).json({count: orders.length, orders})
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}
// get a particular order
const getAnOrder = async (req, res)=>{
    try {
        const id = req.params.id
        const order = await Order.findById(id)
        if(!order){
            console.log('Couldnt find that order');
            return res.status(400).send("No order found")
        }
        if(order.user !== req.user.email){
            console.log('Order doesnt belong to the user');
            return res.status(400).send("No order found")            
        }
        return res.status(200).json({order})
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}


// update an order - this route is just to showcase development skill, normally orders should not be edited after they are 
// made, they can only be cancelled
const updateOrder = async(req, res)=>{
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)
        if(!order){
            console.log('No such order');
            return res.status(400).send("Order doesnt exist")
        }
        if(order.user !== req.user.email){
            console.log('Order doesnt belong to the user');
            return res.status(400).send("No order found")            
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {$set: req.body}, {new: true})
        return res.status(201).json({
            msg: "Order Updated",
            Order: updatedOrder
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

// delete an order/ cancel an order
const deleteOrder = async(req, res)=>{
    try {
        const id = req.params.id
        const order = await Order.findById(id)
        if(!order){
            console.log('Couldnt find that order');
            return res.status(400).send("No order found")
        }
        if(order.user !== req.user.email){
            console.log('Order doesnt belong to the user');
            return res.status(400).send("No order found")            
        }
        await Order.findByIdAndDelete(id)
        return res.status(200).send('Order has been deleted')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)      
    }
}

const deleteAllOrders = async(req, res)=>{
    try {
        await Order.deleteMany({user:req.user.email})
        return res.status(200).send('All Orders have been deleted')
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

// completed order route - a user should mark an order completed when they receive the order
const receivedOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order by orderId
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order's completed status
        order.completed = true;
        await order.save();
        

        return res.status(200).json({ message: 'Order has been received therefore marked as completed' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error ' + error  });
    }
}

const getPendingOrder = async(req, res)=>{
    try {
        const pendingOrder = await Order.find({delivered : false, isCanceled : false})
        if(!pendingOrder){
            console.log('No pending order at the moment')
            return res.status(400).send("No Pending Order at the moment")
        }
        console.log(pendingOrder)
        return res.status(200).json({msg: "Here are the pending orders", pendingOrder})
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Error ' + error.message)
    }


}

module.exports = {
    getOrders, 
    getAnOrder,  
    updateOrder, 
    deleteOrder, 
    deleteAllOrders, 
    placeOrder, 
    receivedOrder,
    getPendingOrder
}

// Routes for V1.2
// get my most expensive order
// const sortOrder = async(req, res)=>{

//     try {
//         const orders = await Order.find()

//     } catch (error) {
        
//     }
// }
// get my orders from previous months
// get my order from a particular restuarant
// get a list of all restaurants, the food and their rating
// completed order route
// getFoods()

// //I will find a way to call this function in the placeOrder
// async function createOrder(food) {
//     let totalPrice = 0
//     for(let t=0; t<food.length; t++){
//         totalPrice += food[t].price
//     }
//     const newOrder = await Order.create({
//         food, 
//         address : "userAddress", //correct this later to be the main user add
//         user: req.user.email,
//         takeOut: true,
//         paymentOnDelivery: false,
//         totalPrice: 1000
//     })
//     return newOrder
// }
