const express = require('express')
const router = express.Router()
const {getPendingOrder, acceptToDeliverOrder, deliverOrder, deliveryComplete} = require('../controllers/DeliveryContrl')
const {isAuthenticated, isAgent} = require("../isAuthenticated") 


router.route('/getPendingOrder').get(isAuthenticated, isAgent,getPendingOrder)
router.route('/acceptOrder/:id').put(isAuthenticated, isAgent, acceptToDeliverOrder)
router.route('/deliverOrder').post(isAuthenticated, deliverOrder)
router.route('/deliveryComplete').post(isAuthenticated, isAgent, deliveryComplete)

module.exports = router