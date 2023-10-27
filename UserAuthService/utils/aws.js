const AWS = require('aws-sdk')
AWS.config.update({
    accessKeyId: process.env.AWS_AccessKeyID,
    secretAccessKey: process.env.AWS_SecretAccessKey,
    region: process.env.AWS_Region
})

const ses = new AWS.SES({region: process.env.AWS_Region})

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


module.exports = {ses, listIdentities, checkVerifiedEmail}