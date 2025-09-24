const mongoose = require('mongoose');
const { Schema } = mongoose;

const vendorSchema = new Schema({
  code: { type: String, trim: true, sparse: true },
  name: { type: String, required: true, trim: true, unique: true },
  phone: { type: String, trim: true, index: true, sparse: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  openingBalance: { type: Number, default: 0 }, 
  isActive: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

vendorSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Vendor', vendorSchema);
