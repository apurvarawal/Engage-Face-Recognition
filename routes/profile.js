const express = require('express')
const router = express.Router();
const {Authenticate} = require('../middleware/authMiddleware')


router.get('/profile', Authenticate, (req, res) => {
    res.render('profile');
})


module.exports = router;