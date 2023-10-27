const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const connectDB = require('./database/db')
const UserRouter = require('./routes/userRoutes')
connectDB()

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cors())
app.use(morgan('dev'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

//mounting routers
app.use('/meal-api/v1/auth/', UserRouter)
app.get('./', (res, req)=>{
    req.redirect()

})

const PORT = process.env.PORT || 9602
app.listen(PORT, ()=>{
    console.log(`User-Auth Service Server is running on ${PORT}`);
})