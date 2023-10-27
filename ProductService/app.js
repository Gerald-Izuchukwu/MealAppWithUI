const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const connectDB = require('./database/db')
const rabbitConnect = require('./rabbitConnect')
const FoodRouter = require('./routes/foodRoutes')
connectDB()
rabbitConnect()

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cors())
app.use(morgan('dev'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

//mounting routers
app.use('/meal-api/v1/food/', FoodRouter)

const PORT = process.env.PORT || 9601
app.listen(PORT, ()=>{
    console.log(`Product Service Server is running on ${PORT}`);
})