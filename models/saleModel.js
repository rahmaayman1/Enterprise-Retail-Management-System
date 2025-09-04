const mongoose = require('mongoose');
const { Schema } = mongoose;

const saleItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  unitCostAtSale: { type: Number, required: true, min: 0 }, // لتقرير الربح
  discount: { type: Number, default: 0, min: 0 }, // خصم على السطر
  taxRate: { type: Number, default: 0 } // %
}, { _id: false });

const saleSchema = new Schema({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  invoiceNo: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },

  items: { type: [saleItemSchema], validate: v => v.length > 0 },

  subTotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  taxTotal: { type: Number, default: 0, min: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },

  paymentMethod: { type: String, enum: ['CASH','CARD','TRANSFER','MIXED'], default: 'CASH' },
  paymentStatus: { type: String, enum: ['UNPAID','PARTIAL','PAID'], default: 'PAID' },
  status: { type: String, enum: ['OPEN','POSTED','REFUNDED','CANCELLED'], default: 'POSTED' },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

saleSchema.index({ branch: 1, invoiceNo: 1 }, { unique: true });
saleSchema.index({ date: -1 });
saleSchema.index({ 'items.product': 1 });
saleSchema.index({ customer: 1 });

module.exports = mongoose.model('Sale', saleSchema);
