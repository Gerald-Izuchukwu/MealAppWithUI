const successPage = (req, res)=>{
    res.render('confirmation', {message: 'A confirmation link has been sent to your email'})
}

const signUpPage = function(req, res){
    res.render("signUp")
}

const loginPage = function(req, res){
    res.render('login')
}

module.exports = {
    successPage,
    signUpPage,
    loginPage
}