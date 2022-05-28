const User = require('../models/User');
const jwt = require('jsonwebtoken')

//handling errors of user data
const handleErrors = (err) => {
    let errors = {email:'', password:''}
    //duplication error
    if(err.code === 11000){
        errors.email = 'Email already taken';
        // console.log(errors);
        return errors;
    };
    //validation errors
    if(err.message.includes("user validation failed")){
        Object.values(err.errors).forEach(({properties}) => {
            if(properties.path === 'email'){
                errors.email = 'Enter the email again'
            }
            if(properties.path === 'password'){
                errors.password = properties.message
            }
            errors[properties.path] = properties.message;
            // console.log(errors)
        });
        return errors;
    }
}

function createToken (id) {
    return jwt.sign({id}, 'SecretKey', {
        expiresIn: 24*60*60
    })
}

module.exports.get_signup = (req, res) => {
    res.render('signup-page')
}
module.exports.get_login = (req, res) => {
    res.render('login-page')
}
module.exports.post_signup = async (req, res) => {
    try{
        const user = await User.create(req.body)
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true})
        // console.log(user.json());
        res.status(201).json({user: user._id})
    }
    catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors})
    }
    // res.send('Post req for signup')
}
module.exports.post_login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true});
        res.status(200).json({ user: user._id })
    }
    catch(err){
        let errors = { email:'', password:'' }
        console.log(err.message);
        if(err.message === "Incorrect email"){
            errors.email = err.message;
        }
        if(err.message === "Incorrect password"){
            errors.password = err.message;
        }
        console.log(errors);

        res.status(400).json({errors})
    }
}

module.exports.returnId =  (token) => {
    console.log(token);
}

module.exports.get_logout = (req, res) => {
    res.cookie('jwt', '', { maxAge:1 })
    res.redirect('/login')
}