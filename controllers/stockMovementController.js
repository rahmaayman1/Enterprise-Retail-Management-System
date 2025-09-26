const StockMovement = require('../models/stockMovementModel');
const Product = require('../models/productModel');

// Get all stockMovement
const getAll = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate('productId', 'name stock')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get stockMovement by ID
const getById = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('productId', 'name stock');
    if (!movement) return res.status(404).json({ message: 'Movement not found' });
    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create stockMovement(IN/OUT)
const create = async (req, res) => {
  try {
    const { product, direction, qty, reason, notes } = req.body;

    const dbProduct = await Product.findById(product);
    if (!dbProduct) return res.status(404).json({ message: 'Product not found' });

    const beforeQty = dbProduct.stock;

    if (direction === 'IN') {
      dbProduct.stock += qty;
    } else if (direction === 'OUT') {
      if (dbProduct.stock < qty) {
        return res.status(400).json({ message: 'Insufficient stock for this OUT movement' });
      }
      dbProduct.stock -= qty;
    }

    await dbProduct.save();

    const movement = new StockMovement({
      product,
      direction,
      reason,
      qty,
      notes,
      beforeQty,
      afterQty: Number(dbProduct.stock) || 0,
      branch: branch || null,
      createdBy: req.user ? req.user.id : null
    });

    const savedMovement = await movement.save();
    res.status(201).json(savedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//modify stockMovement
const update = async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    if (quantity && quantity !== movement.qty) {
      const product = await Product.findById(movement.product);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const diff = quantity - movement.qty;

      if (movement.type === 'IN') {
        product.stock += diff;
      } else if (movement.type === 'OUT') {
        if (product.stock < diff) {
          return res.status(400).json({ message: 'Insufficient stock for this update' });
        }
        product.stock -= diff;
      }
      await product.save();
      movement.qty = quantity;
    }

    if (notes) movement.notes = notes;

    const updatedMovement = await movement.save();
    res.json(updatedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete stockMovement
const remove = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    const product = await Product.findById(movement.product);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (movement.type === 'IN') {
      if (product.stock < movement.qty) {
        return res.status(400).json({ message: 'Cannot delete IN movement, stock too low' });
      }
      product.stock -= movement.qty;
    } else if (movement.type === 'OUT') {
      product.stock += movement.qty;
    }

    await product.save();
    await movement.deleteOne();

    res.json({ message: 'Stock movement deleted successfully' });
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
