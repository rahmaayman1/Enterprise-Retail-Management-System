const Purchase = require('../models/purchaseModel');
const Vendor = require('../models/vendorModel'); 
const Product = require('../models/productModel');

// GET all purchases
const getAll = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('vendor', 'name')      
      .populate('items.productId', 'name price') 
      .sort({ createdAt: -1 });        
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET purchase by ID
const getById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('vendor', 'name')
      .populate('items.productId', 'name price');

    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE purchase
const create = async (req, res) => {
  try {
    const { vendorId, items, notes } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
    }

    const purchase = new Purchase({
      vendor: vendorId,
      items,
      notes,
      createdBy: req.user.id, 
    });

    const savedPurchase = await purchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE purchase
const update = async (req, res) => {
  try {
    const { vendorId, items, notes } = req.body;

    const updatedData = {};
    if (vendorId) updatedData.vendor = vendorId;
    if (items) updatedData.items = items;
    if (notes) updatedData.notes = notes;

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).populate('vendor', 'name').populate('items.productId', 'name price');

    if (!updatedPurchase) return res.status(404).json({ message: 'Purchase not found' });

    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE purchase
const remove = async (req, res) => {
  try {
    const deletedPurchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!deletedPurchase) return res.status(404).json({ message: 'Purchase not found' });

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
