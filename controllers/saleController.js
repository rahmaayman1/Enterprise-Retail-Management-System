const Sale = require('../models/saleModel');
const Product = require('../models/productModel');
const Customer = require('../models/customerModel'); 

// GET all sales
const getAll = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.product', 'name sku costPrice salePrice')
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
      .populate('items.product', 'name sku costPrice salePrice')
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
    console.log('=== CREATE SALE DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    console.log('========================');

    const { items, customer, paymentMethod, notes, branch } = req.body;

    
    if (!items || items.length === 0) {
      console.error('No items in the sale');
      return res.status(400).json({ message: 'No items in the sale' });
    }

    // Generate invoiceNo if not provided
    const invoiceNo = req.body.invoiceNo || `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    console.log('Using invoice number:', invoiceNo);

    console.log('Items to process:', items.length);

    let subTotal = 0;

    // check and update stock for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}:`, item);

      if (!item.product) {
        console.error(`Item ${i + 1}: Missing product ID`);
        return res.status(400).json({ message: `Item ${i + 1}: Missing product ID` });
      }

      if (!item.qty || item.qty <= 0) {
        console.error(`Item ${i + 1}: Invalid quantity`);
        return res.status(400).json({ message: `Item ${i + 1}: Invalid quantity` });
      }

      if (!item.unitPrice || item.unitPrice < 0) {
        console.error(`Item ${i + 1}: Invalid unit price`);
        return res.status(400).json({ message: `Item ${i + 1}: Invalid unit price` });
      }

      try {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`Product not found: ${item.product}`);
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }

        console.log(`Product found: ${product.name}, Stock: ${product.quantity}, Requested: ${item.qty}`);

        if (product.quantity < item.qty) {
          console.error(`Insufficient stock for product: ${product.name}`);
          return res.status(400).json({ 
            message: `Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.qty}` 
          });
        }

        // Update product quantity
        product.quantity -= item.qty;
        await product.save();
        console.log(`Updated product ${product.name} stock to: ${product.quantity}`);

        subTotal += item.unitPrice * item.qty;
      } catch (productError) {
        console.error('Error processing product:', productError);
        return res.status(400).json({ message: `Error processing product: ${productError.message}` });
      }
    }

    console.log('Calculated subtotal:', subTotal);

    const discountTotal = req.body.discountTotal || 0;
    const taxTotal = req.body.taxTotal || 0;
    const shipping = req.body.shipping || 0;
    const grandTotal = subTotal - discountTotal + taxTotal + shipping;

    console.log('Final totals:', { subTotal, discountTotal, taxTotal, shipping, grandTotal });

    // build sale data
    const saleData = {
      invoiceNo: invoiceNo,
      items,
      customer: customer || null,
      paymentMethod: paymentMethod || 'CASH',
      notes: notes || '',
      subTotal,
      discountTotal,
      taxTotal,
      shipping,
      grandTotal,
      paymentStatus: req.body.paymentStatus || 'PAID',
      status: req.body.status || 'POSTED',
      date: req.body.date || new Date()
    };

    
    if (branch) {
      saleData.branch = branch;
    }

    if (req.body.createdBy) {
      saleData.createdBy = req.body.createdBy;
    } else if (req.user && req.user.id) {
      saleData.createdBy = req.user.id;
    }

    console.log('Sale data to save:', JSON.stringify(saleData, null, 2));

    try {
      const sale = new Sale(saleData);
      const savedSale = await sale.save();
      
      console.log('Sale saved successfully:', savedSale._id);
      res.status(201).json(savedSale);
    } catch (saveError) {
      console.error('Error saving sale:', saveError);
      
      // validation error handling
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(key => ({
          field: key,
          message: saveError.errors[key].message
        }));
        console.error('Validation errors:', validationErrors);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }
      
      return res.status(500).json({ message: `Error saving sale: ${saveError.message}` });
    }

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      .populate('items.product', 'name sku costPrice salePrice')
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
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.qty;
        await product.save();
      }
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET today's sales total and count

const getTodaySales = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$grandTotal" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAmount = result[0]?.totalAmount || 0;
    const salesCount = result[0]?.count || 0;

    res.json({
      value: totalAmount,
      count: salesCount
    });
  } catch (err) {
    console.error('Error fetching today sales:', err);
    res.status(500).json({ message: 'Failed to fetch today sales' });
  }
};


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getTodaySales,
};
