const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/emailService');
const logger = require('../utils/logger');
const bcrypt=require("bcrypt");

//Get All users
const getAll = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json({ users });
    } catch (error) {
        logger.error(`Get all users failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

//Get user by ID
const getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        logger.error(`Get user by ID failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

//Create new user
const create = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!password) return res.status(400).json({ message: 'Password is required' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists!' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ 
            name, 
            email, 
            passwordHash: hashedPassword,
            role 
        });
         
        await sendEmail(
            email,
            'Welcome to Retail Management System',
            `Hello ${name},\n\nYour account has been created successfully with role: ${role}.`
        );

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        logger.error(`Create user failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// update user
const update = async (req, res) => {
    try {
        const { name, email, password, role, status, branches } = req.body;
        const updateData = { name, email, role, status, branches };

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        logger.error(`Update user failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

//delete user
const remove = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error(`Delete user failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };
