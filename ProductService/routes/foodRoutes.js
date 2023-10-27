const express = require('express')
const router = express.Router()
const {
    addFood, 
    getAFood, 
    getFood, 
    buyFood,
    getFoodBasedOnType,
    deleteFood, 
    updateFood, 
    getDiscountedFood,
    mostExpensiveFood,
} = require('../controllers/FoodContrl')
const {isAdmin, isAuthenticated} = require('../isAuthenticated')
const {foodPage, drinkPage} = require('../pages/productPages')


router.route('/buy-food').post(isAuthenticated, buyFood)
router.route('/get-food').get( getFood)
router.route('/get-food-page').get(foodPage)
router.route('/get-food-type').get( getFoodBasedOnType)
router.route('/add-food').post(isAuthenticated, addFood)
router.route('/discountedFoods').get(getDiscountedFood)
router.route('/mostExpensiveFood').get(mostExpensiveFood)
router.route("/:id").get(isAuthenticated, getAFood).delete(isAuthenticated, isAdmin, deleteFood).put(isAuthenticated,isAdmin,updateFood)
module.exports = router