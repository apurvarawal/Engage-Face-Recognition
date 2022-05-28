const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authController')
const Authenticate = require('../middleware/authMiddleware')

// const router = Router();

router.get('/signup', authControllers.get_signup)

router.post('/signup', authControllers.post_signup)

router.get('/login', authControllers.get_login)

router.post('/login', authControllers.post_login)

router.get('/logout', authControllers.get_logout)



module.exports = router;