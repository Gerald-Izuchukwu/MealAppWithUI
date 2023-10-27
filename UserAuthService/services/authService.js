const {ses, listIdentities, checkVerifiedEmail} = require('../utils/aws.js')
const User = require('../models/UserModel.js')
const {transporter, sendMailPromise} = require('../utils/nodemailer.js')

const registerServiceWithAWS = (user)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const {name, email, password} = user
            const Identities = await listIdentities()
            if(Identities.includes(email)){
                const verifiedEmail = await checkVerifiedEmail(email)
                if(!verifiedEmail){ // if the email is in identities but not verified
                    ses.verifyEmailIdentity({EmailAddress: email}).send()
                    resolve({success: true, emailVerficationRequired: true})

                }else if(verifiedEmail){ //if the user's email is already verfied and it is not in the database, just proceed to create the user profile
                    console.log("email is verified")
                    await User.create(user) //incase something happens to our identity list
                    resolve({success: true, emailVerficationRequired: false})
                }
            }else{
                ses.verifyEmailIdentity({EmailAddress: email}).send()
                resolve({success: true,  emailVerficationRequired: true})
            }
        } catch (error) {
            console.log(error)
            reject({success: false, err})
        }
    })

}

const registerServiceWithNodeMailer = (user)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const {email} = user
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject : 'MealApp Confirmation Mail',
                text: 'You are receivng this mail because you registered on the MealApp Platform. If you did not initiate this action kindly ignore this message, else click here to verify http://authservice:9602/meal-api/v1/auth/saveuser'
            }
            const result = await sendMailPromise(mailOptions)
            if(result){
                resolve({success: true, emailVerificationRequired: true})
            }
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

module.exports = {registerServiceWithAWS, registerServiceWithNodeMailer}





// const result = await registerServiceWithAWS(user)
// if(result.success){
//     if(result.emailVerificationRequired){
//         return res.redirect(200, 'http://authservice:9602/meal-api/v1/auth/success')
//         // return res.status(200).send('A confirmation link has been sent to your email')
//     }
//     else if(!result.emailVerificationRequired){ //if the user's email is already verfied and it is not in the database, just proceed to create the user profile
//         return res.redirect(200, '/loginPage')
//     }
// }else if(!result.success){
//     return res.status(400).send('There was an error')
// }

































// const register = async(req, res)=>{
//     try { 
//         const {firstName, lastName, email, password} = req.body;
//         const userExists = await User.findOne({email})
//         if(userExists){
//             console.log('This user exists');
//             return res.status(400).send('This email is already registered, please log in')
//         }
//         const name = `${firstName} ${lastName}`
//         const user = {
//             name, email, password
//         }
//         await rabbitConnect().then((channel)=>{
//             channel.sendToQueue("USER", Buffer.from(JSON.stringify({user})))
//             console.log('Sending user to USER queue');
//             return
//         })
//         const Identities = await listIdentities()
//         if(Identities.includes(email)){
//             const verifiedEmail = await checkVerifiedEmail(email)
//             if(!verifiedEmail){
//                 ses.verifyEmailIdentity({EmailAddress: email}).send()
//                 return res.redirect(200, 'http://authservice:9602/meal-api/v1/auth/success')
//             }else if(verifiedEmail){ //if the user's email is already verfied and it is not in the database, just proceed to create the user profile
//                 console.log("email is verified")
//                 await User.create(user) //incase something happens to our identity list
//                 return res.redirect(200, '/loginPage')
//             }
//         }else{
//             ses.verifyEmailIdentity({EmailAddress: email}).send()
//             // return res.status(200).send('A confirmation link has been sent to your email')
//             return res.redirect(200, 'http://authservice:9602/meal-api/v1/auth/success')
//         }
//     }catch(error){
//         console.log(error);
//         return res.status(500).send('Internal server Error '+ error)
//     }
// }