const Sale = require('../models/saleModel');
const Product = require('../models/productModel');
const Customer = require('../models/customerModel'); 

// GET all sales
const getAll = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.productId', 'name price')
      .populate('customer', 'name')
      .sort({ createdAt: -1 }); 
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET sale by ID
const getById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.productId', 'name price')
      .populate('customer', 'name');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE sale
const create = async (req, res) => {
  try {
    const { items, customer, paymentMethod, notes } = req.body;

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      // Update inventory
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const sale = new Sale({
      items,
      customer,
      paymentMethod,
      notes,
      createdBy: req.user.id
    });

    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE sale
const update = async (req, res) => {
  try {
    const { items, customer, paymentMethod, notes } = req.body;

    const updatedData = {};
    if (items) updatedData.items = items;
    if (customer) updatedData.customer = customer;
    if (paymentMethod) updatedData.paymentMethod = paymentMethod;
    if (notes) updatedData.notes = notes;

    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, updatedData, { new: true })
      .populate('items.productId', 'name price')
      .populate('customer', 'name');

    if (!updatedSale) return res.status(404).json({ message: 'Sale not found' });
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE sale
const remove = async (req, res) => {
  try {
    const deletedSale = await Sale.findByIdAndDelete(req.params.id);
    if (!deletedSale) return res.status(404).json({ message: 'Sale not found' });

    for (let item of deletedSale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({ message: 'Sale deleted successfully' });
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
