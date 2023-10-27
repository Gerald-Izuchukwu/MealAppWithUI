const express = require('express')
const router = express.Router()
const {
    getOrders, 
    getAnOrder, 
    updateOrder, 
    deleteOrder, 
    deleteAllOrders, 
    placeOrder, 
    receivedOrder,
    getPendingOrder
} = require('../controllers/OrderContrl')
const isAuthenticated = require('../isAuthenticated')

router.route('/myOrders').get( isAuthenticated, getOrders).delete(isAuthenticated, deleteAllOrders)
router.route('/placeOrder' ).post( placeOrder)
router.route('/receivedOrder').post(isAuthenticated, receivedOrder)
router.route('/getPendingOrder').get(getPendingOrder)
router.route('/myOrders/:id' ).get(isAuthenticated,getAnOrder).put(isAuthenticated,updateOrder).delete(isAuthenticated,deleteOrder)

module.exports = router