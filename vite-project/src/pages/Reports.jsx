import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

// Import real services
import { reportsService } from '../services/reportService';
import { salesService } from '../services/salesService';
import { productService } from '../services/productService';
import { purchaseService } from '../services/purchaseService';
import { ledgerService } from '../services/ledgerService';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const [reportData, setReportData] = useState({
    sales: null,
    inventory: null,
    profit: null,
    purchases: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Update date range based on selected period
    const today = new Date();
    let from, to;
    
    switch (selectedPeriod) {
      case 'today':
        from = to = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = to = yesterday.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        from = startOfWeek.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        from = lastWeekStart.toISOString().split('T')[0];
        to = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        from = lastMonth.toISOString().split('T')[0];
        to = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'thisYear':
        from = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      case 'custom':
        // Keep current values
        return;
      default:
        return;
    }
    
    if (from && to) {
      setDateFrom(from);
      setDateTo(to);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    generateReport();
  }, [selectedReport]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        period: selectedPeriod,
        startDate: dateFrom,
        endDate: dateTo
      };

      switch (selectedReport) {
        case 'sales':
          await generateSalesReport(filters);
          break;
        case 'inventory':
          await generateInventoryReport();
          break;
        case 'profit':
          await generateProfitReport(filters);
          break;
        case 'purchases':
          await generatePurchasesReport(filters);
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Failed to generate report: ' + (err.message || 'Unknown error'));
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = async (filters) => {
    try {
      // Get sales data from the API
      const salesData = await salesService.getSalesByDateRange(filters.startDate, filters.endDate);
      
      if (Array.isArray(salesData)) {
        // Calculate totals
        const totalSales = salesData.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
        const totalTransactions = salesData.length;
        const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

        // Get top products
        const productSales = {};
        salesData.forEach(sale => {
          if (sale.items) {
            sale.items.forEach(item => {
              const productKey = item.product._id || item.product;
              if (!productSales[productKey]) {
                productSales[productKey] = {
                  name: item.product.name || 'Unknown Product',
                  quantity: 0,
                  revenue: 0
                };
              }
              productSales[productKey].quantity += item.qty || 0;
              productSales[productKey].revenue += (item.qty * item.unitPrice) || 0;
            });
          }
        });

        const topProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        // Generate daily sales for the period
        const dailySales = generateDailySalesData(salesData, filters.startDate, filters.endDate);

        setReportData(prev => ({
          ...prev,
          sales: {
            totalSales,
            totalTransactions,
            avgTransactionValue,
            topProducts,
            dailySales,
            rawData: salesData
          }
        }));
      }
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  };

  const generateInventoryReport = async () => {
    try {
      const products = await productService.getAllProducts();
      
      if (Array.isArray(products)) {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => 
          sum + ((product.quantity || 0) * (product.costPrice || 0)), 0
        );
        const lowStockItems = products.filter(p => 
          (p.quantity || 0) <= (p.reorderLevel || 0)
        ).length;

        // Group by category
        const categoryGroups = {};
        products.forEach(product => {
          const categoryName = typeof product.category === 'object' 
            ? product.category.name 
            : product.category || 'Uncategorized';
          
          if (!categoryGroups[categoryName]) {
            categoryGroups[categoryName] = {
              name: categoryName,
              count: 0,
              value: 0
            };
          }
          
          categoryGroups[categoryName].count++;
          categoryGroups[categoryName].value += (product.quantity || 0) * (product.costPrice || 0);
        });

        const categories = Object.values(categoryGroups)
          .sort((a, b) => b.value - a.value);

        setReportData(prev => ({
          ...prev,
          inventory: {
            totalProducts,
            totalValue,
            lowStockItems,
            categories,
            outOfStockItems: products.filter(p => (p.quantity || 0) === 0).length
          }
        }));
      }
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  };

  const generateProfitReport = async (filters) => {
    try {
      // Get profit data from ledger service
      const profitData = await ledgerService.getProfitAndLoss(filters.startDate, filters.endDate);
      
      // Also get sales data to calculate product-specific profits
      const salesData = await salesService.getSalesByDateRange(filters.startDate, filters.endDate);
      
      let grossProfit = 0;
      let totalRevenue = 0;
      const productProfits = {};

      if (Array.isArray(salesData)) {
        salesData.forEach(sale => {
          totalRevenue += sale.grandTotal || 0;
          
          if (sale.items) {
            sale.items.forEach(item => {
              const profit = ((item.unitPrice || 0) - (item.unitCostAtSale || 0)) * (item.qty || 0);
              grossProfit += profit;

              const productKey = item.product._id || item.product;
              if (!productProfits[productKey]) {
                productProfits[productKey] = {
                  name: item.product.name || 'Unknown Product',
                  profit: 0,
                  revenue: 0,
                  cost: 0
                };
              }
              
              productProfits[productKey].profit += profit;
              productProfits[productKey].revenue += (item.qty * item.unitPrice) || 0;
              productProfits[productKey].cost += (item.qty * item.unitCostAtSale) || 0;
            });
          }
        });
      }

      // Calculate margins for top profitable products
      const topProfitableProducts = Object.values(productProfits)
        .map(product => ({
          ...product,
          margin: product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

      const netProfit = grossProfit - (profitData?.totalExpenses || 0);
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

      setReportData(prev => ({
        ...prev,
        profit: {
          grossProfit,
          netProfit,
          profitMargin: parseFloat(profitMargin),
          totalRevenue,
          expenses: profitData?.totalExpenses || 0,
          topProfitableProducts
        }
      }));
    } catch (error) {
      console.error('Error generating profit report:', error);
      throw error;
    }
  };

  const generatePurchasesReport = async (filters) => {
    try {
      const purchasesData = await purchaseService.getAllPurchases({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      if (Array.isArray(purchasesData)) {
        const totalPurchases = purchasesData.reduce((sum, purchase) => sum + (purchase.grandTotal || 0), 0);
        const totalOrders = purchasesData.length;
        const avgOrderValue = totalOrders > 0 ? totalPurchases / totalOrders : 0;

        // Group by vendor
        const vendorGroups = {};
        purchasesData.forEach(purchase => {
          const vendorName = typeof purchase.vendor === 'object' 
            ? purchase.vendor.name 
            : 'Unknown Vendor';
          
          if (!vendorGroups[vendorName]) {
            vendorGroups[vendorName] = {
              name: vendorName,
              orders: 0,
              totalAmount: 0
            };
          }
          
          vendorGroups[vendorName].orders++;
          vendorGroups[vendorName].totalAmount += purchase.grandTotal || 0;
        });

        const topVendors = Object.values(vendorGroups)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);

        setReportData(prev => ({
          ...prev,
          purchases: {
            totalPurchases,
            totalOrders,
            avgOrderValue,
            topVendors,
            rawData: purchasesData
          }
        }));
      }
    } catch (error) {
      console.error('Error generating purchases report:', error);
      throw error;
    }
  };

  const generateDailySalesData = (salesData, startDate, endDate) => {
    const dailyMap = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Initialize all dates with 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }
    
    // Fill with actual sales data
    salesData.forEach(sale => {
      const saleDate = new Date(sale.date || sale.createdAt).toISOString().split('T')[0];
      if (dailyMap.hasOwnProperty(saleDate)) {
        dailyMap[saleDate] += sale.grandTotal || 0;
      }
    });
    
    return Object.entries(dailyMap).map(([date, sales]) => ({ date, sales }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateReport();
    setRefreshing(false);
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const filters = {
        period: selectedPeriod,
        startDate: dateFrom,
        endDate: dateTo
      };
      
      await reportsService.downloadReport(selectedReport, filters);
      alert('Report downloaded successfully!');
    } catch (err) {
      alert('Failed to download report: ' + (err.message || 'Unknown error'));
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, bgColor = "bg-white" }) => (
    <div className={`${bgColor} p-6 rounded-lg border border-gray-200 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-teal-100 rounded-lg">
          <Icon className="w-6 h-6 text-teal-600" />
        </div>
      </div>
    </div>
  );

  const SalesReportTab = () => {
    const salesData = reportData.sales;
    if (!salesData) return <div className="text-center py-8">No sales data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={`₦${salesData.totalSales.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Transactions"
            value={salesData.totalTransactions.toLocaleString()}
            icon={ShoppingCart}
          />
          <StatCard
            title="Avg. Transaction"
            value={`₦${Math.round(salesData.avgTransactionValue).toLocaleString()}`}
            icon={Activity}
          />
          <StatCard
            title="Products Sold"
            value={salesData.topProducts.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
            icon={Package}
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 font-medium text-gray-700">Quantity Sold</th>
                    <th className="text-left py-3 font-medium text-gray-700">Revenue</th>
                    <th className="text-left py-3 font-medium text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.topProducts.map((product, index) => {
                    const percentage = salesData.totalSales > 0 ? (product.revenue / salesData.totalSales) * 100 : 0;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                            {product.name}
                          </div>
                        </td>
                        <td className="py-3">{product.quantity}</td>
                        <td className="py-3 font-medium">₦{product.revenue.toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            {percentage.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Sales Chart</p>
                <p className="text-sm text-gray-400">
                  {salesData.dailySales.length} days of data available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InventoryReportTab = () => {
    const inventoryData = reportData.inventory;
    if (!inventoryData) return <div className="text-center py-8">No inventory data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={inventoryData.totalProducts.toLocaleString()}
            icon={Package}
          />
          <StatCard
            title="Total Value"
            value={`₦${inventoryData.totalValue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Low Stock Items"
            value={inventoryData.lowStockItems.toString()}
            icon={AlertTriangle}
            bgColor="bg-red-50"
          />
          <StatCard
            title="Out of Stock"
            value={inventoryData.outOfStockItems.toString()}
            icon={Activity}
            bgColor="bg-orange-50"
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inventory by Category</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 font-medium text-gray-700">Products</th>
                    <th className="text-left py-3 font-medium text-gray-700">Total Value</th>
                    <th className="text-left py-3 font-medium text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.categories.map((category, index) => {
                    const percentage = inventoryData.totalValue > 0 ? (category.value / inventoryData.totalValue) * 100 : 0;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{category.name}</td>
                        <td className="py-3">{category.count}</td>
                        <td className="py-3 font-medium">₦{category.value.toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            {percentage.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfitReportTab = () => {
    const profitData = reportData.profit;
    if (!profitData) return <div className="text-center py-8">No profit data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Profit"
            value={`₦${profitData.grossProfit.toLocaleString()}`}
            icon={TrendingUp}
            bgColor="bg-green-50"
          />
          <StatCard
            title="Net Profit"
            value={`₦${profitData.netProfit.toLocaleString()}`}
            icon={DollarSign}
            bgColor={profitData.netProfit >= 0 ? "bg-green-50" : "bg-red-50"}
          />
          <StatCard
            title="Profit Margin"
            value={`${profitData.profitMargin}%`}
            icon={PieChart}
          />
          <StatCard
            title="Total Expenses"
            value={`₦${profitData.expenses.toLocaleString()}`}
            icon={Activity}
            bgColor="bg-orange-50"
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Most Profitable Products</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 font-medium text-gray-700">Profit</th>
                    <th className="text-left py-3 font-medium text-gray-700">Margin %</th>
                    <th className="text-left py-3 font-medium text-gray-700">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.topProfitableProducts.map((product, index) => {
                    const contribution = profitData.grossProfit > 0 ? (product.profit / profitData.grossProfit) * 100 : 0;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                            {product.name}
                          </div>
                        </td>
                        <td className="py-3 font-medium text-green-600">
                          ₦{Math.round(product.profit).toLocaleString()}
                        </td>
                        <td className="py-3">{product.margin}%</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(contribution, 100)}%` }}
                              ></div>
                            </div>
                            {contribution.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleDownloadReport}
            disabled={downloading || !reportData[selectedReport]}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Generating Report</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={generateReport}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedReport('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedReport === 'sales'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales Report
            </button>
            <button
              onClick={() => setSelectedReport('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedReport === 'inventory'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Inventory Report
            </button>
            <button
              onClick={() => setSelectedReport('profit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedReport === 'profit'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Profit & Loss
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating {selectedReport} report...</p>
              </div>
            </div>
          ) : (
            <>
              {selectedReport === 'sales' && <SalesReportTab />}
              {selectedReport === 'inventory' && <InventoryReportTab />}
              {selectedReport === 'profit' && <ProfitReportTab />}
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Sales Summary</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Export detailed sales transactions and summaries</p>
          <button 
            onClick={() => setSelectedReport('sales')}
            className="w-full px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            View Sales Report
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <Package className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium">Stock Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Current inventory valuation and stock levels</p>
          <button 
            onClick={() => setSelectedReport('inventory')}
            className="w-full px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
          >
            View Inventory
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-medium">Financial Performance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Comprehensive profit & loss analysis</p>
          <button 
            onClick={() => setSelectedReport('profit')}
            className="w-full px-3 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors"
          >
            View P&L Report
          </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Report Period: {dateFrom} to {dateTo}
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            {reportData[selectedReport] && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Data Loaded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;