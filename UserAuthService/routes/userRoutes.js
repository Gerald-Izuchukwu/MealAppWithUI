const express = require('express')
const router = express.Router()
const {
    register, saveUser, callSaveUser, 
    login, resetPassword, updatePassword, 
    getUserByID, signOut, 
} = require('../controllers/UserContrl')

const {signUpPage, successPage, loginPage} = require('../pages/authPages')

router.route("/success").get(successPage)
router.route('/register').post(register).get(signUpPage)
router.route('/saveuser').post(saveUser).get(callSaveUser)
router.route('/login').post(login).get(loginPage)
router.route('/:id').get(getUserByID).put(updatePassword)
router.route('/resetpassword').post(resetPassword)
router.route('/logout').delete(signOut)


module.exports = router