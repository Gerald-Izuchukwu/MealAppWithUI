// how do i call saveUser now?
const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const rabbitConnect = require('../rabbitConnect')
const access_secret = process.env.JWT_ACCESS_TOKEN_SECRET_DEV
const refresh_secret = process.env.JWT_REFRESH_TOKEN_SECRET_DEV
const ses = require('../utils/aws')
const axios = require('axios').default
const {registerServiceWithAWS, registerServiceWithNodeMailer} = require('../services/authService.js')

// do this. create remove the saving of user from the register controller. create a fucntion-save user
// once the user reisters, he receives a message and that user details is sent to a queue called user queue
// once the user click on the confirm mail, which is a route, save user route consumes the USER queue and saves that data to db


const listIdentities = () =>{
    return new Promise((resolve, reject)=>{
        ses.listIdentities((err, data)=>{
            if(err){
                console.log(err)
                reject(err)
            }
            resolve(data.Identities)
        })
    })

}

const checkVerifiedEmail = (emailAddress)=>{
    return new Promise((resolve, reject)=>{
        const params = {
            Identities : [emailAddress]
        }
        ses.getIdentityVerificationAttributes(params, (err, data)=>{
            if(err){
                console.log(err)
                reject(err)
            }
            const verificationAttributes = data.VerificationAttributes[emailAddress]
            if(verificationAttributes.VerificationStatus === 'Success'){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    })
}

const register = async(req, res)=>{
    try { 
        const {firstName, lastName, email, password} = req.body;
        const userExists = await User.findOne({email})
        if(userExists){
            console.log('This user exists');
            return res.status(400).send('This email is already registered, please log in')
        }
        const name = `${firstName} ${lastName}`
        const user = {
            name, email, password
        }
        await rabbitConnect().then((channel)=>{
            channel.sendToQueue("USER", Buffer.from(JSON.stringify({user})))
            console.log('Sending user to USER queue');
            return
        })

        // const result = await registerServiceWithAWS(user)
        const result = await registerServiceWithNodeMailer(user)
        console.log(result)
        if(result.success){
            if(result.emailVerificationRequired){
                return res.redirect(200, 'http://authservice:9602/meal-api/v1/auth/success')
                // return res.status(200).send('A confirmation link has been sent to your email')
            }
            else if(!(result.emailVerificationRequired)){ //if the user's email is already verfied and it is not in the database, just proceed to create the user profile
                return res.redirect(200, '/loginPage')
            }
        }else if(!(result.success)){
            return res.status(400).send('There was an error')
        }
    }catch(error){
        console.log(error);
        return res.status(500).send('Internal server Error '+ error)
    }
}

const callSaveUser = (req, res)=>{
    axios.post("http://authservice:9602/meal-api/v1/auth/saveuser")
}

const saveUser = async(req, res)=>{
    try {

        await rabbitConnect().then((channel)=>{
            channel.consume("USER", (data)=>{
                const {user} = JSON.parse(data.content)
                console.log(user)
                User.create(user) //for aws, remove this line and uncomment the below code
                // ses.listIdentities((err, data)=>{
                //     if(err){
                //         console.log(err)
                //         return
                //     }
                //     console.log(data.Identities)
                //     const {email} = user
                //     if(data.Identities.includes(email)){
                //         checkVerifiedEmail(email).then((data)=>{
                //             if(data === true){
                //                 User.create(user)
                //                 console.log(email)
                //                 console.log('yes')
                //                 return res.status(201).json({"msg":"User saved", user})
                //             }
                //             else if(data === false){
                //                 channel.sendToQueue("USER", Buffer.from(JSON.stringify({user})))
                //                 console.log('Sending user back to USER queue since user isnt verified ');
                //                 return
                //             }
                //         })


                //     }
                // })
                channel.ack(data)
                channel.close()
                
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server Error '+ error)
    }

}

const login = async(req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email}) 
        if(!user){
            console.log('user does not exist');
            return res.status(404).send('This email is not registered, please register')
        }//this function is just for test, for production, detleted this function and just leave check for incorect pasword
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            console.log('Password doesnt match');
            return res.status(404).send('Incorrect password')
        }else{
            const payload = {
                email, name:user.name, role: user.role
            }
            const access_token = jwt.sign(payload, access_secret, {expiresIn: '10m'})
            const refresh_token = jwt.sign({email}, refresh_secret, {expiresIn: '1d'})
            res.cookie('jwt', refresh_token, { 
                httpOnly: true, 
                sameSite: 'None', secure: true, 
                maxAge: 24 * 60 * 60 * 1000 
                }
            )
            return res.status(200).json({access_token, payload})
            // const access_token = jwt.sign(payload, access_secret, {expiresIn: '1h'}, (err, token)=>{
            //     if(err){
            //         console.log(err);
            //         return res.status(400).send('there was an error signing you in')
            //     }
            //     return res.status(200).json({token})
            // })
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server Error '+ error)
    }
}

const getUserByID = async(req, res)=>{
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if(!user){
            console.log('No user found');
            return res.status(400).send('No user found')
        }
        return res.status(200).json({user})
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server Error '+ error)
    }
}

// change password route
const updatePassword = async(req, res)=>{
    try {
        const id = req.params.id
        const {newPassword, retypeNewPassword} = req.body
        const user = await User.findOne({_id: id})
        if(!user){
            console.log('user not found')
            return res.status(404).send('No user with this email found. Try signing up')
        }
        if(!(newPassword) || !(retypeNewPassword)){
            return res.status(400).send('Please enter your new password')
        }
        if(!(newPassword === retypeNewPassword)){
            return res.status(400).send('Passwords do not match')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUser = await User.findOneAndUpdate({_id: id}, {password: hashedPassword }, {
            new:true,
            runValidators: true
        },)

            return res.status(200).json({"password updated": user})

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server Error '+ error)
    }

}
// reset Password -forgotten password
const resetPassword = async(req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        console.log('user not found')
        return res.status(404).send('No user with this email found. Try signing up')
    }
    const params = {
        Source: 'geraldlouisugwunna@gmail.com',
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: 'Password Reset',
          },
          Body: {
            Text: {
              Data: 'Hello from MealApp! This is a password reset link. Kindly follow the link to change your password. If you didnt request for this, please ignore '+ `http://authservice:9602/meal-api/v1/auth/updatepassword?id=${user.id}`,
            },
          },
        },
    };
    ses.sendEmail(params, (err, data) => {
        if (err) {
          console.error('Error sending email:', err);
          return res.status(400).send('There was an eerror')
        } else {
          console.log('Email sent successfully:', data);
          console.log('Reset link has been sent')
          return res.status(200).send(`A reset link has been sent to your email:${params.Destination.ToAddresses}`)
        }
    })

}
// email verification route
// user roles - admin or customer
// deactivate account
//token refresh
// signout route
const signOut = (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      });
    } else {
      res.end()
    }
}
module.exports = {
    register, saveUser, callSaveUser, 
    login, getUserByID, resetPassword, 
    updatePassword, signOut,
}




// // save user using aws----when i get my account back
// const saveUser = async(req, res)=>{
//     try {

//         await rabbitConnect().then((channel)=>{
//             channel.consume("USER", (data)=>{
//                 const {user} = JSON.parse(data.content)
//                 console.log(user)
//                 ses.listIdentities((err, data)=>{
//                     if(err){
//                         console.log(err)
//                         return
//                     }
//                     console.log(data.Identities)
//                     const {email} = user
//                     if(data.Identities.includes(email)){
//                         checkVerifiedEmail(email).then((data)=>{
//                             if(data === true){
//                                 User.create(user)
//                                 console.log(email)
//                                 console.log('yes')
//                                 return res.status(201).json({"msg":"User saved", user})
//                             }
//                             else if(data === false){
//                                 channel.sendToQueue("USER", Buffer.from(JSON.stringify({user})))
//                                 console.log('Sending user back to USER queue since user isnt verified ');
//                                 return
//                             }
//                         })


//                     }
//                 })
//                 channel.ack(data)
//                 channel.close()
                
//             })
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send('Internal server Error '+ error)
//     }

// }