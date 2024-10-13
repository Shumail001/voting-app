const mongoose = require("mongoose")
var bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true,
    },
    email:{
        type: String,
        unique: true,
    },
    mobile:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    IdCard:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['admin','voter'],
        default: 'voter',
    },
    isVoted:{
        type: Boolean,
        default: false,
    }
});

userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password, salt);
        user.password = hashPassword;
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});


// Define matchPassword method
userSchema.methods.matchPassword = async function (enteredPassword) {
    try{
        return await bcrypt.compare(enteredPassword, this.password);
    }catch(err){
        throw err;
    }
};




const User = mongoose.model("User",userSchema);


module.exports = User