const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  sku: { type: String, required: true, unique: true, trim: true }, // Stock Keeping Unit
  name: { type: String, required: true, trim: true, index: true },
  barcode: { type: String, trim: true, sparse: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: String, trim: true },
  unit: { type: String, default: 'pcs' }, // pcs, box, kg, ...
  costPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 }, // %
  expiryTracking: { type: Boolean, default: false }, 
  reorderLevel: { type: Number, default: 0, min: 0 }, //low stock alert
  isActive: { type: Boolean, default: true },
  description: String
}, { timestamps: true });

productSchema.index({ name: 'text', sku: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
