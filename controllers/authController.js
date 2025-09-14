//authController
const User = require("../models/userModel");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/emailService");

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role  
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: "30d" }
  );
};
// register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

   const hashedPassword= await bcrypt.hash(password,10);
   const user=await User.create({
    name,
    email,
    password:hashedPassword
   });
   
    await sendEmail(
      user.email,
      "Welcome to SAMA Enterprise 🎉",
      `Hi ${user.name},\n\nWelcome to our system! We're glad to have you onboard.`
    );
    
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {

       
      await sendEmail(
        user.email,
        "Login Notification 🔑",
        `Hi ${user.name},\n\nYou just logged into your account. If this wasn't you, please reset your password immediately.`
      );

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
   
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { registerUser, loginUser };
