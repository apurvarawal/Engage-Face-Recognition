const jwt = require('jsonwebtoken');
const User = require('../models/User')

const Authenticate = function (req, res, next) {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'SecretKey', (err, decoded) => {
            if(err){
                res.redirect('/login')
            }else{
                // console.log(decoded.id);
                next();
            }
        })
    }
    else{
        res.redirect('/login')
    }
}

const checkCurrentUser = function (req, res, next){
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'SecretKey', async (err, decoded) => {
            if(err){
                res.locals.user = null;
                next();
            }else{
                // console.log(decoded.id);
                let user = await User.findById({_id : decoded.id});
                res.locals.user = user;
                next();
            }
        })
    }
    else{
        res.locals.user = null;
        next();
    }
}

module.exports = {Authenticate, checkCurrentUser};