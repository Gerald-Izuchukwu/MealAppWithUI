const {Swallow, SingleFood, Soup, Dish, Drinks, Snacks, Protien} = require('../models/FoodModel')

// const foodPage = (req, res)=>{
//     res.render('food')
// }

const drinkPage = function(req, res){
    res.render('drinks')
}

const foodPage=async(req,res)=>{
    const swallows = await Swallow.find()
    const soups = await Soup.find()
    const singleFoods = await SingleFood.find()
    const dishes = await Dish.find()
    const drinks = await Drinks.find()
    const protiens = await Protien.find()
    const snacks = await Snacks.find()
    const ff1 = swallows.map((swallow)=>{
        return [swallow.name, swallow.price]
    })
    const ff2 = soups.map((soup)=>{
        return [soup.name, soup.price]
    })
    const ff3 = singleFoods.map((singleFood)=>{
        return [singleFood.name, singleFood.price]
    })
    const food = [
        // ff1,
        // ff2,
        // ff3
        ...singleFoods,
        ...swallows,
        ...soups,
        ...dishes,
        ...drinks,
        ...protiens,
        ...snacks,
    ]
    res.render('products', {food})
    console.log(food);
}

module.exports = {
    foodPage,
    drinkPage,
}