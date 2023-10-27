// const Food = require('../models/FoodModel')
const {Soup, Swallow, SingleFood, Snacks, Drinks, Dish, Protien, Food} = require('../models/FoodModel')
const rabbitConnect = require('../rabbitConnect')
const axios = require('axios').default


const buyFood =async(req, res)=>{
    try {
        const {ids} = req.body;
        const createdOrderArray = []
        const soup = await Soup.find({_id: {$in: ids}})
        const swallow = await Swallow.find({_id: {$in: ids}})
        const snacks = await Snacks.find({_id: {$in: ids}})
        const singleFood = await SingleFood.find({_id: {$in: ids}})
        const protien = await Protien.find({_id: {$in: ids}})
        const dish = await Dish.find({_id: {$in: ids}})
        const drinks = await Drinks.find({_id: {$in: ids}})
        const food = [
            ...soup, 
            ...swallow,
            ...snacks,
            ...singleFood,
            ...protien,
            ...dish,
            ...drinks,
        ]
        const dataToSend = {food, timestamp: Date.now()}
        await rabbitConnect().then((channel)=>{
            channel.sendToQueue("ORDER", Buffer.from(JSON.stringify({dataToSend})))//later we add userEmail from req.user.email
            console.log("sending food to ORDER queue")
            return
        }).then(()=>{
            axios.post("http://orderservice:9600/meal-api/v1/order/placeOrder", {user: req.user.email}).catch((err)=>{console.log(err.message);})
        })

        rabbitConnect().then((channel)=>{
            channel.consume("PRODUCT", (data)=>{
                console.log("consuming PRODUCT Queue")
                const createdOrder =  JSON.parse(data.content)
                createdOrderArray.push(createdOrder)
                console.log(JSON.parse(data.content));
                channel.ack(data)
            })
            setTimeout(()=>{
                channel.close()
                return res.status(200).json(createdOrderArray[0])

            }, 2000)
        })


    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }

}

const addFood = async(req, res)=>{
    try {
        const {name, description, ofType, discount, soupPrice, swallowPrice, drinkPrice, protienPrice, snacksPrice, singleFoodPrice, dishPrice} = req.body
        if(ofType === "Dish"){
            if(!(name, description, dishPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newDish = await Dish.create({
                name, description, dishPrice, discount
            })
            return res.status(201).json({msg: "Dish Saved", newDish})
        }else if (ofType === "Soup"){
            if(!(name,  soupPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newSoup = new Soup({
                name,  soupPrice, 
            })
            const soup = await newSoup.save()
            return res.status(201).json({msg: "Soup Saved", soup})
        }else if (ofType === "Swallow"){
            if(!(name,  swallowPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newSwallow = new Swallow({
                name,  swallowPrice, 
            })
            const swallow = await newSwallow.save()
            return res.status(201).json({msg: "Swallow Saved", swallow})
        }else if (ofType === "SingleFood"){
            if(!(name,  singleFoodPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newSingleFood = new SingleFood({
                name,  singleFoodPrice, 
            })
            const singleFood = await newSingleFood.save()
            return res.status(201).json({msg: "Food Saved", singleFood})
        }else if (ofType === "Snacks"){
            if(!(name,  snacksPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newSnacks = new Snacks({
                name,  snacksPrice, 
            })
            const snacks = await newSnacks.save()
            return res.status(201).json({msg: "Snacks Saved", snacks})
        }else if (ofType === "Protien"){
            if(!(name,  protienPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newProtien = new Protien({
                name,  protienPrice, 
            })
            const protien = await newProtien.save()
            return res.status(201).json({msg: "Protien Saved", protien})
        }else if (ofType === "Drink"){
            if(!(name,  drinkPrice, ofType)){
                return res.status(400).send('Please enter all required fields')
        
            }
            const newDrink = new Drinks({
                name,  drinkPrice, 
            })
            const drink = await newDrink.save()
            return res.status(201).json({msg: "Drink Saved", drink})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }

}

const getFood = async(req, res)=>{
    try {
        const soups = await Soup.find()
        const swallow = await Swallow.find()
        const snacks = await Snacks.find()
        const singleFood = await SingleFood.find()
        const protien = await Protien.find()
        const dish = await Dish.find()
        const drinks = await Drinks.find()
        const food = [
            {
                "soups": {...soups}, 
                "swallow": {...swallow} ,
                "singleFood": {...singleFood},
                "snacks": {...snacks},
                "drinks": {...drinks},
                "dish": {...dish},
                "protiens": {...protien}
            }
        ]
        return res.status(200).json({food})
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

const getFoodBasedOnType = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).send('Please provide a valid food type');
        }

        let foods;

        switch (type) {
            case 'soups':
                foods = await Soup.find();
                break;
            case 'snacks':
                foods = await Snacks.find();
                break;
            case 'swallow':
                foods = await Swallow.find();
                break;
            case 'singleFood':
                foods = await SingleFood.find();
                break;
            case 'protien':
                foods = await Protien.find();
                break;
            case 'dish':
                foods = await Dish.find();
                break;
            case 'drinks':
                foods = await Drinks.find();
                break;
            default:
                return res.status(400).send('Invalid food type');
        }

        if (!foods || foods.length === 0) {
            console.log(`No ${type} found`);
            return res.status(400).send(`We couldn't find any ${type}`);
        }

        return res.status(200).json({ [type] : foods });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message);
    }
}

// get a particular food
const getAFood = async (req, res) => {
    try {
        const { type, id } = req.params;
        let foodModel;

        switch (type) {
            case 'soups':
                foodModel = Soup;
                break;
            case 'snacks':
                foodModel = Snacks;
                break;
            case 'swallow':
                foodModel = Swallow;
                break;
            case 'singleFood':
                foodModel = SingleFood;
                break;
            case 'protien':
                foodModel = Protien;
                break;
            case 'dish':
                foodModel = Dish;
                break;
            case 'drinks':
                foodModel = Drinks;
                break;
            default:
                return res.status(400).send('Invalid food type');
        }

        const food = await foodModel.findById(id);

        if (!food) {
            console.log(`Couldn't find that ${type}`);
            return res.status(400).send(`No ${type} found`);
        }

        return res.status(200).json({ food });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message);
    }
};

// update a food, also be used to discount food
const updateFood = async(req, res)=>{
    try {
        const foodId = req.params.id
        const {type} = req.query
        let food
        let foodModel;

        switch (type) {
            case 'soups':
                food = await Soup.findById(foodId);
                foodModel = Soup
                break;
            case 'snacks':
                food = await Snacks.findById(foodId);
                foodModel= Snacks
                break;
            case 'swallow':
                food = await Swallow.findById(foodId);
                foodModel = Swallow
                break;
            case 'singleFood':
                food = await SingleFood.findById(foodId);
                foodModel = SingleFood
                break;
            case 'protien':
                food = await Protien.findById(foodId);
                foodModel = Protien
                break;
            case 'dish':
                food = await Dish.findById(foodId);
                foodModel = Dish
                break;
            case 'drinks':
                food = await Drinks.findById(foodId);
                foodModel = Drinks
                break;
            default:
                return res.status(400).send('Invalid food type');
        }
        if(!food){
            console.log('No such Food');
            return res.status(400).send("Food doesnt exist")
        }
        const updatedFood = await foodModel.findByIdAndUpdate(foodId, {$set: req.body}, {new: true})
        return res.status(201).json({
            msg: "Food Updated",
            Food: updatedFood
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}
// delete this food
const deleteFood = async (req, res) => {
    try {
        const { type, id } = req.params;
        let foodModel;

        switch (type) {
            case 'soups':
                foodModel = Soup;
                break;
            case 'snacks':
                foodModel = Snacks;
                break;
            case 'swallow':
                foodModel = Swallow;
                break;
            case 'singleFood':
                foodModel = SingleFood;
                break;
            case 'protien':
                foodModel = Protien;
                break;
            case 'dish':
                foodModel = Dish;
                break;
            case 'drinks':
                foodModel = Drinks;
                break;
            default:
                return res.status(400).send('Invalid food type');
        }

        const food = await foodModel.findByIdAndDelete(id);

        if (!food) {
            console.log(`Couldn't find that ${type}`);
            return res.status(400).send(`No ${type} found`);
        }

        return res.status(200).json({ food });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message);
    }
};

// get my most expensive food
const mostExpensiveFood = async(req, res)=>{
    try {
        // get all food
        // loop through the food
        // get the on with the highest price
        // return that food
        const {type} = req.query
        let foods;
        let price;
        switch (type) {
            case "soups":
                foods = await Soup.find()
                price = foods.soupPrice
                break;
            case "snacks":
                foods = await Snacks.find()
                break;
            case "swallow":
                foods = await Swallow.find()
                break;
            case "singleFood":
                foods = await SingleFood.find()
                break;
            case "protien":
                foods = await Protien.find()
                break;
            case "drinks":
                foods = await Drinks.find()
                break;
            case "dish":
                foods = await Dish.find()
                break;
            default:
                break;
        }
        const mostExpensiveFood = foods.reduce((maxFood, currentFood) => {
                if (!maxFood || currentFood.price > maxFood.price) {
                return currentFood;
                } else {
                return maxFood;
                }
            }, 
            null
        )
        return res.status(200).send(mostExpensiveFood)

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message)
    }
}

// discount foods
const getDiscountedFood = async (req, res) => {
    try {
        const { type } = req.params;
        let foodModel;

        switch (type) {
            case 'soups':
                foodModel = Soup;
                break;
            case 'snacks':
                foodModel = Snacks;
                break;
            case 'swallow':
                foodModel = Swallow;
                break;
            case 'singleFood':
                foodModel = SingleFood;
                break;
            case 'protien':
                foodModel = Protien;
                break;
            case 'dish':
                foodModel = Dish;
                break;
            case 'drinks':
                foodModel = Drinks;
                break;
            default:
                return res.status(400).send('Invalid food type');
        }

        const foods = await foodModel.find();
        const discountedFood = foods.filter(food => food.discount === true);

        if (discountedFood.length <= 0) {
            return res.status(200).send(`Sorry, no discounted ${type} at the moment`);
        }

        return res.status(200).json({ discountedFood });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error ' + error.message);
    }
};

module.exports = {
    addFood, 
    getAFood, 
    buyFood,
    getFood,
    getFoodBasedOnType, 
    deleteFood, 
    updateFood, 
    getDiscountedFood, 
    mostExpensiveFood,
}

// routes for v1.2
// mark order as ready for pickup
// receive order sent 
//update a food (eg, update price)
// discount a food
// get all Orders from a user