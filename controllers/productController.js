const Product = require('../models/productModel');

// get all products
const getAll = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// get product by ID
const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    if (error.kind === 'ObjectId') {  
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Create new product
const create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// update product
const update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // ترجع المنتج بعد التحديث وتتحقق من صحة البيانات
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// delete product by ID
const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
