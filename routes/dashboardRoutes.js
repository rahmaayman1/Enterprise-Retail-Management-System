// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const Sale = require('../models/saleModel');
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const Customer = require('../models/customerModel');
const Vendor = require('../models/vendorModel');

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Getting dashboard stats...');

    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts with error handling
    let totalProducts = 0, totalCustomers = 0, totalVendors = 0;
    let todaySales = 0, thisWeekSales = 0, thisMonthSales = 0, totalSales = 0;
    let lowStockProducts = 0, todayRevenue = 0, thisMonthRevenue = 0;

    try {
      totalProducts = await Product.countDocuments();
    } catch (err) {
      console.warn('Error counting products:', err.message);
    }

    try {
      totalCustomers = await Customer.countDocuments();
    } catch (err) {
      console.warn('Error counting customers:', err.message);
    }

    try {
      totalVendors = await Vendor.countDocuments();
    } catch (err) {
      console.warn('Error counting vendors:', err.message);
    }

    try {
      lowStockProducts = await Product.countDocuments({ quantity: { $lte: 10 } });
    } catch (err) {
      console.warn('Error counting low stock products:', err.message);
    }

    try {
      todaySales = await Sale.countDocuments({ 
        createdAt: { $gte: today, $lt: tomorrow }
      });
    } catch (err) {
      console.warn('Error counting today sales:', err.message);
    }

    try {
      thisWeekSales = await Sale.countDocuments({ 
        createdAt: { $gte: thisWeekStart }
      });
    } catch (err) {
      console.warn('Error counting this week sales:', err.message);
    }

    try {
      thisMonthSales = await Sale.countDocuments({ 
        createdAt: { $gte: thisMonthStart }
      });
    } catch (err) {
      console.warn('Error counting this month sales:', err.message);
    }

    try {
      totalSales = await Sale.countDocuments();
    } catch (err) {
      console.warn('Error counting total sales:', err.message);
    }

    // Calculate revenue
    try {
      const todaySalesData = await Sale.find({ 
        createdAt: { $gte: today, $lt: tomorrow }
      });
      todayRevenue = todaySalesData.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    } catch (err) {
      console.warn('Error calculating today revenue:', err.message);
    }

    try {
      const thisMonthSalesData = await Sale.find({ 
        createdAt: { $gte: thisMonthStart }
      });
      thisMonthRevenue = thisMonthSalesData.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    } catch (err) {
      console.warn('Error calculating this month revenue:', err.message);
    }

    const stats = {
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      customers: {
        total: totalCustomers
      },
      vendors: {
        total: totalVendors
      },
      sales: {
        today: todaySales,
        thisWeek: thisWeekSales,
        thisMonth: thisMonthSales,
        total: totalSales
      },
      revenue: {
        today: todayRevenue,
        thisMonth: thisMonthRevenue
      }
    };

    console.log('Dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get dashboard stats',
      error: error.message 
    });
  }
});

// GET recent transactions
router.get('/recent-transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log(`Getting ${limit} recent transactions...`);

    let transactions = [];

    try {
      const recentSales = await Sale.find()
        .populate('customer', 'name')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

      transactions = recentSales.map(sale => ({
        _id: sale._id,
        type: 'sale',
        invoiceNo: sale.invoiceNo || `SALE-${sale._id}`,
        customer: sale.customer?.name || 'Walk-in Customer',
        amount: sale.grandTotal || 0,
        items: sale.items?.length || 0,
        date: sale.createdAt,
        status: sale.status || 'POSTED'
      }));
    } catch (err) {
      console.warn('Error getting recent sales:', err.message);
    }

    console.log(`Found ${transactions.length} recent transactions`);
    res.json(transactions);
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ 
      message: 'Failed to get recent transactions',
      error: error.message 
    });
  }
});

// GET sales chart data
router.get('/sales-chart', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      try {
        const salesData = await Sale.find({
          createdAt: { $gte: date, $lt: nextDate }
        });
        
        const totalSales = salesData.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
        
        chartData.push({
          date: date.toISOString().split('T')[0],
          sales: totalSales,
          count: salesData.length
        });
      } catch (err) {
        console.warn(`Error getting sales for ${date.toISOString().split('T')[0]}:`, err.message);
        chartData.push({
          date: date.toISOString().split('T')[0],
          sales: 0,
          count: 0
        });
      }
    }
    
    res.json(chartData);
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ 
      message: 'Failed to get sales chart data',
      error: error.message 
    });
  }
});

// GET top products
router.get('/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    try {
      const topProducts = await Sale.aggregate([
        { $unwind: '$items' },
        { 
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.qty' },
            totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            sku: '$product.sku',
            totalQuantity: 1,
            totalRevenue: 1
          }
        }
      ]);
      
      res.json(topProducts);
    } catch (err) {
      console.warn('Error getting top products:', err.message);
      res.json([]);
    }
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ 
      message: 'Failed to get top products',
      error: error.message 
    });
  }
});

module.exports = router;