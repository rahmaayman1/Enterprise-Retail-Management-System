const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockMovementSchema = new Schema({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },

  direction: { type: String, enum: ['IN','OUT'], required: true },
  reason: { 
    type: String, 
    enum: [
      'PURCHASE','SALE','RETURN_IN','RETURN_OUT',
      'ADJUSTMENT','TRANSFER_IN','TRANSFER_OUT','DAMAGE'
    ], 
    required: true 
  },

  qty: { type: Number, required: true, min: 0.000001 },
  unitCost: { type: Number, default: 0, min: 0 }, // مفيد لتكلفة المخزون
  batchNo: { type: String, trim: true },
  expiryDate: Date,

  refType: { type: String, enum: ['Purchase','Sale','Manual','Transfer','Adjustment','Return'] },
  refId: { type: Schema.Types.ObjectId }, // id للفاتورة/المستند

  beforeQty: { type: Number, min: 0 }, // اختياري لو بتخزّني رصيد لحظي
  afterQty: { type: Number, min: 0 },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

stockMovementSchema.index({ branch: 1, product: 1, createdAt: -1 });
stockMovementSchema.index({ refType: 1, refId: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
