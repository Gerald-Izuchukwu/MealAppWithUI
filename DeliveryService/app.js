const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const express = require('express')
const morgan = require('morgan')
const app = express()
const connectDB = require('./database/db')
const DeliveryRouter = require('./routes/index.js')
connectDB()

app.use(morgan('dev'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

//mounting routers
app.use('/meal-api/v1/delivery/', DeliveryRouter)

const PORT = process.env.PORT || 9603
app.listen(PORT, ()=>{
    console.log(`Delivery Service Server is running on ${PORT}`);
})