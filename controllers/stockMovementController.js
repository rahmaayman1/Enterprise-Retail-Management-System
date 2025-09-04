const StockMovement = require('../models/stockMovementModel');
const Product = require('../models/productModel');

// جلب كل الحركات
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

// جلب حركة معينة بالـ ID
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

// إضافة حركة جديدة (IN أو OUT)
const create = async (req, res) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // تحديث المخزون حسب نوع الحركة
    if (type === 'IN') {
      product.stock += quantity;
    } else if (type === 'OUT') {
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock for this OUT movement' });
      }
      product.stock -= quantity;
    }

    await product.save();

    const movement = new StockMovement({
      productId,
      type,
      quantity,
      notes,
      createdBy: req.user.id
    });

    const savedMovement = await movement.save();
    res.status(201).json(savedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل حركة المخزون
const update = async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    // تعديل المخزون لو الكمية اتغيرت
    if (quantity && quantity !== movement.quantity) {
      const product = await Product.findById(movement.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const diff = quantity - movement.quantity;

      if (movement.type === 'IN') {
        product.stock += diff;
      } else if (movement.type === 'OUT') {
        if (product.stock < diff) {
          return res.status(400).json({ message: 'Insufficient stock for this update' });
        }
        product.stock -= diff;
      }
      await product.save();
      movement.quantity = quantity;
    }

    if (notes) movement.notes = notes;

    const updatedMovement = await movement.save();
    res.json(updatedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف حركة المخزون
const remove = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    const product = await Product.findById(movement.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // استرجاع المخزون عند حذف الحركة
    if (movement.type === 'IN') {
      if (product.stock < movement.quantity) {
        return res.status(400).json({ message: 'Cannot delete IN movement, stock too low' });
      }
      product.stock -= movement.quantity;
    } else if (movement.type === 'OUT') {
      product.stock += movement.quantity;
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
