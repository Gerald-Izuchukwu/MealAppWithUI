const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const moniker = require('moniker')
const { generateUsername } = require("unique-username-generator");


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,

    },
    role:{
        type:String,
        required: true,
        enum:['admin', 'user', 'delivery-agent'],
        default: 'user'
    },

    uniqueUser: {
        type: String,
        required: false,
        default: generateUniqueUser()
    },
    email: {
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
}, {
    timestamps: true
})
  



UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

function generateUniqueUser(){
    const userName = generateUsername('-', 3)
    return userName
}


// UserSchema.pre('save', async function(next){
//     const userName = generateFromEmail(this.email, 3)
//     this.uniqueUser = userName
//     next()
// })

const User = mongoose.model('User', UserSchema)
module.exports = User