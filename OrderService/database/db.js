const mongoose = require('mongoose')
// const MONGO_URI_DEV = process.env.MONGO_URI
const MONGO_URI_DEV = `mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@mongodb:27017`


const connectDB = async ()=>{
    try {
        await mongoose.connect(MONGO_URI_DEV)
        console.log(`database connected on ${MONGO_URI_DEV}`);

    } catch (error) {
        console.log(error);
        return error
    }
}
module.exports = connectDB