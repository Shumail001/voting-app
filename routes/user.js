const express = require("express")
const User = require("../models/user")
const userRoute = express.Router()
const {GenerateToken, authMiddleware} = require("../middleware/auth")



userRoute.post("/signup", async (req, res) => {
    try {
        const data = req.body;

        // Check if an admin already exists
        const checkAdmin = await User.findOne({ role: "admin" });

        if (data.role === "admin" && checkAdmin) {
            return res.status(400).json("Admin is already registered");
        }

        // Proceed to create the user
        const newUser = new User(data);
        const user = await newUser.save();

        if (!user) {
            return res.status(400).json({ "error": "Failed to create User" });
        }

        // Generate token or any additional logic
        const payload = {
            name: user.name,
            age: user.age,
            role: user.role,
            id: user.id,
        };
        const token = GenerateToken(payload);
        console.log(token);

        return res.status(201).json({ "message": "User Created Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json("Internal Server Error");
    }
});


userRoute.post("/login", async(req,res) => {
    try{
        const { idcard, password } = req.body;
        if(!password || !idcard){
            return res.status(403).json("Invalid Json")
        }
        const user = await User.findOne({IdCard: idcard})
    
        if(!user || !(await user.matchPassword(password))){
            return res.status(404).json("Invaid Credentials name or IdCared");
        }
        const payload = {
            name: user.name,
            age: user.age,
            role: user.role,
            id: user.id,
        }
        const token = GenerateToken(payload);
        console.log(token);
        return res.status(200).json({user,token});
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }
})

userRoute.get("/",authMiddleware, async(req, res) => {
    try{
        const users = await User.find({});
        if(!users){
            return res.status(404).json("message", "Failed to get users")
        }
        return res.status(200).json(users)
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }
})

userRoute.get("/profile", authMiddleware, async(req, res) => {
    const user = req.userToken;
    const userId = user.id;
    const existedUser = await User.findById(userId)
    if(!existedUser){
        return res.status(404).json("Invalid Signatueor May be Expire")
    }
    return res.status(200).json(existedUser)
})

userRoute.put("/profile/password", authMiddleware, async (req, res) => {
    try {
        const { existingPassword, newPassword } = req.body;
        const userId = req.userToken.id;

        // Find user by ID
        const user = await User.findById(userId);

        // Check if existing password is correct
        if (!user || !(await user.matchPassword(existingPassword))) {
            return res.status(400).json("Invalid credentials");
        }

        if (newPassword.length < 6) {
            return res.status(400).json("Password should be at least 6 characters long");
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json("Password Updated Successfully");
    } catch (err) {
        console.error(err);
        return res.status(500).json("Internal Server Error");
    }
});


module.exports = userRoute