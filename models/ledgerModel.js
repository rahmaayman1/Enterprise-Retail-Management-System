const mongoose = require('mongoose');
const { Schema } = mongoose;

const ledgerSchema = new Schema({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },

  accountType: { 
    type: String, 
    enum: ['VENDOR','CUSTOMER','CASH','BANK','EXPENSE','REVENUE','OTHER'], 
    required: true 
  },
  accountRef: { type: Schema.Types.ObjectId }, 

  date: { type: Date, default: Date.now },
  description: String,

  //debit/credit
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },

  refType: { type: String, enum: ['Purchase','Sale','Payment','Receipt','Adjustment','Opening'] },
  refId: { type: Schema.Types.ObjectId },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ledgerSchema.index({ branch: 1, date: -1 });
ledgerSchema.index({ accountType: 1, accountRef: 1, date: -1 });
ledgerSchema.index({ refType: 1, refId: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);
