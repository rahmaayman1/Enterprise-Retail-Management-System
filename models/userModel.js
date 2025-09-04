const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const roles = ['Admin', 'Manager', 'Accountant', 'Cashier', 'Warehouse Staff']



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
       enum: roles, 
       default: 'Cashier' },
  },
  { timestamps: true }
);



module.exports = mongoose.model("User", userSchema);
