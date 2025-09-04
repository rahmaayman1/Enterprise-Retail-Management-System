const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, lowercase: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
