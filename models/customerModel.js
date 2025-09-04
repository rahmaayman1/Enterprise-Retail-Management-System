const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
  code: { type: String, trim: true, sparse: true }, // اختياري
  name: { type: String, required: true, trim: true, index: true },
  phone: { type: String, trim: true, index: true, sparse: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  address: String,
  taxNumber: String,
  openingBalance: { type: Number, default: 0 }, // رصيد افتتاحي (مدين +)
  isActive: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

customerSchema.index({ name: 'text', email: 1 });

module.exports = mongoose.model('Customer', customerSchema);
