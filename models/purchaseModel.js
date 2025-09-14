const mongoose = require('mongoose');
const { Schema } = mongoose;

const purchaseItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 }, 
  taxRate: { type: Number, default: 0 }, // %
  batchNo: { type: String, trim: true },
  expiryDate: Date
}, { _id: false });

const purchaseSchema = new Schema({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  invoiceNo: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },

  items: { type: [purchaseItemSchema], validate: v => v.length > 0 },

  subTotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  taxTotal: { type: Number, default: 0, min: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },

  paymentStatus: { type: String, enum: ['UNPAID','PARTIAL','PAID'], default: 'UNPAID' },
  status: { type: String, enum: ['OPEN','POSTED','CANCELLED'], default: 'OPEN' },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

purchaseSchema.index({ branch: 1, invoiceNo: 1 }, { unique: true });
purchaseSchema.index({ date: -1 });
purchaseSchema.index({ vendor: 1 });
purchaseSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
