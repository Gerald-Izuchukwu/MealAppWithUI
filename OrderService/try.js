const axios = require('axios').default
const express = require("express")

const getstuff = async()=>{
    const stuff = await axios.post("http://localhost:9601/meal-api/v1/food/buy-food")
    const resp = stuff.data
    console.log(resp);
}

getstuff()