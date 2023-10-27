const jwt = require('jsonwebtoken')
const secret = process.env.JWTSECRET
async function isAuthenticated(req, res, next){
    // creating header to be "Bearer <token>", if its splited using space " ", then it becomes an array of two elem - Bearer and token
    const token = req.headers["authorization"].split(" ")[1]

    // verify the token to know if its legit
    jwt.verify(token, secret, (err, user)=>{
        if (err){
            console.log(err);
            return res.status(400).send("You are not authenticated to access this route, please log in")
        }else{
            req.user = user
            next()
        }
    } )

}

async function isAdmin(req, res, next){
    if(!(req.user.role==='admin')){
        return res.status(400).send("You are not authorized to access this route")
    }else{
        next()
    }

}

module.exports = {isAuthenticated, isAdmin}