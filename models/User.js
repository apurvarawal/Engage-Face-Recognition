const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Not a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Minimum password length must be greater than 6 characters']
    },
    profilePic: {
        type: String
        // required: false
    },
    azureId: {
        type: String
    },
    name: {
        type: String
    },
    officialEmail : {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Not a valid email address']
    },
    EnrollmentNo: {
        type: Number
    },
    gender: {
        type: String,
    },
    parentName: {
        type: String
    },
    parentTitle: {
        type: String
    },
    PhoneNumber: {
        type: Number
    }
})

userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
// userSchema.post('save', function(doc, next){
//     console.log('after the user is saved ',doc);
//     next();
// })

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email});
    if(user){
        const Cpass = await bcrypt.compare(password, user.password);
        if(Cpass){
            return user;
        }
        throw Error("Incorrect password");
    }
    throw Error("Incorrect email")
};

const User = mongoose.model('user', userSchema);

module.exports = User