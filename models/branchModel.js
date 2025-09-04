const mongoose = require('mongoose');
const { Schema } = mongoose;

const branchSchema = new Schema({
  code: { type: String, required: true, unique: true, trim: true }, // مثال: BR-001
  name: { type: String, required: true, trim: true },
  phone: String,
  email: String,
  address: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.index({ code: 1 }, { unique: true });
branchSchema.index({ name: 1 });

module.exports = mongoose.model('Branch', branchSchema);
