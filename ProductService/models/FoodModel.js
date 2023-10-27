const mongoose = require('mongoose')

const SoupSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Afang', "Edikaikong", "Egwusi", "White", "Eforiro", "Banga", "Bitterleaf", "Ogbono", "Oha", "Okro", "Pepper-Soup"]
    },
    ofType: {
        type: String,
        enum : ["Soup"]
    },

    price: {
        type: Number,
        required:true,
        default : 0
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

const SwallowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["Pounded Yam", "Eba", "Fufu", "Wheat", "Unripped Plantain", "Ripped Plantain", "Semo", "Amala", "Tuwo Shinkafa", "Tuwo Masara"]

    },

    ofType: {
        type: String,
        enum : ["Swallow"]
    },
    price: {
        type: Number,
        required:true,
        default : 0
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

const SnacksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["Meshai", "Shawarma", "Fruit-Salad", "Small-Chops"]
    },
    ofType: {
        type: String,
        enum : ["Snacks"]
    },

    price: {
        type: Number,
        default : 0,
        required: true
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const DrinksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        // enum: []
    },

    ofType: {
        type: String,
        enum : ["Drink"]
    },

    price: {
        type: Number,
        default : 0,
        required:true
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const SingleFoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Rice', 'Beans', "Yam"]
    },

    ofType: {
        type: String,
        enum : ["SingleFood"]
    },

    price: {
        type: Number,
        default : 0,
        required: true
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const ProtienSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ["Beef", "Fish", "Chicken", "Turkey" ]
    },

    ofType: {
        type: String,
        enum : ["Protien"]
    },

    price: {
        type: Number,
        default : 0,
        required: true
    },
    discount: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const DishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    ofType: {
        type: String,
        enum : ["Dish"]
    },
    description:{
        type: String,
        required: true,
        unique: true
    },
    price:{
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Boolean,
        default: false
    }
    //later we can seperate this to contain Dishes and Drinks
},{
    timestamps: true
})
const FoodSchema = new mongoose.Schema({
    Swallow:SwallowSchema,
    Soup: SoupSchema,
    Snacks: SnacksSchema,
    SingleFood: SingleFoodSchema,
    Protien: ProtienSchema,
    Dish: DishSchema,
    Drinks: DrinksSchema
},{
    timestamps: true
})


const Soup = mongoose.model('Soups', SoupSchema )
const Swallow = mongoose.model('Swallow', SwallowSchema )
const Snacks = mongoose.model('Snacks', SnacksSchema )
const Drinks = mongoose.model('Drinks', DrinksSchema )
const Dish = mongoose.model('Dishes', DishSchema )
const SingleFood = mongoose.model('SingleFood', SingleFoodSchema )
const Protien = mongoose.model('Protiens', ProtienSchema)
const Food = mongoose.model('Food', FoodSchema)
module.exports = {Soup, Swallow, Snacks, Drinks, Dish, SingleFood, Protien, Food}