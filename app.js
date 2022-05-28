const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const authRoutes = require('./routes/authRoutes')
const profilePicRoutes = require('./routes/profilepic')
const cookieParser = require('cookie-parser')
const { Authenticate, checkCurrentUser } = require('./middleware/authMiddleware')
const jwt = require('jsonwebtoken');
const attendance = require('./routes/attendance')
const profileRoutes = require('./routes/profile');
const path = require('path');

// const User = require('./models/User')


const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
const port = process.env.PORT || 3000;
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());
require("dotenv").config();

const mongodbUri = process.env.mongodbUri;

//Connecting to the database
mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Engage'
}).then(result=> console.log("Connected to the database"))
.catch(error => console.log(error))

app.use(checkCurrentUser);
// app.use((req, res, next) => {
//     res.locals.user = "aditya jangir"
//     next();
// })

app.get('/attendance', Authenticate,(req, res) => {
    res.render('attandence-conf')
})

app.get('/schedule', Authenticate, (req, res) => {
    res.render('schedule')
})

app.get('/', (req, res)=>{
    res.render("login-page")
})


app.listen(port, ()=> {
    console.log("Port successfully running at 3000")
})
app.use(authRoutes);
app.use(profilePicRoutes);
app.use(profileRoutes);
app.use(attendance);