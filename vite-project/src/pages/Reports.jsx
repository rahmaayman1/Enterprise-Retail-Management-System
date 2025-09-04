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
  AlertTriangle
} from 'lucide-react';

// Simulated API services
const reportsService = {
  getSalesReport: (filters) => Promise.resolve({
    totalSales: 1250000,
    totalTransactions: 156,
    avgTransactionValue: 8013,
    topProducts: [
      { name: 'Samsung Galaxy S21', quantity: 45, revenue: 1125000 },
      { name: 'iPhone 13 Pro', quantity: 12, revenue: 540000 },
      { name: 'Dell Laptop XPS 13', quantity: 3, revenue: 255000 }
    ],
    dailySales: [
      { date: '2024-01-01', sales: 125000 },
      { date: '2024-01-02', sales: 89000 },
      { date: '2024-01-03', sales: 156000 },
      { date: '2024-01-04', sales: 234000 },
      { date: '2024-01-05', sales: 178000 }
    ]
  }),
  getInventoryReport: () => Promise.resolve({
    totalProducts: 156,
    totalValue: 2450000,
    lowStockItems: 8,
    categories: [
      { name: 'Electronics', count: 89, value: 1890000 },
      { name: 'Computers', count: 34, value: 450000 },
      { name: 'Accessories', count: 33, value: 110000 }
    ]
  }),
  getProfitReport: (startDate, endDate) => Promise.resolve({
    grossProfit: 450000,
    netProfit: 380000,
    profitMargin: 30.4,
    expenses: 70000,
    topProfitableProducts: [
      { name: 'Samsung Galaxy S21', profit: 225000, margin: 20 },
      { name: 'iPhone 13 Pro', profit: 60000, margin: 11.1 },
      { name: 'Dell Laptop XPS 13', profit: 30000, margin: 11.8 }
    ]
  }),
  downloadReport: (reportType, filters) => {
    return Promise.resolve({ success: true, message: 'Report downloaded successfully' });
  }
};

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');
  const [reportData, setReportData] = useState({
    sales: null,
    inventory: null,
    profit: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [selectedReport, selectedPeriod]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        period: selectedPeriod,
        dateFrom: selectedPeriod === 'custom' ? dateFrom : undefined,
        dateTo: selectedPeriod === 'custom' ? dateTo : undefined
      };

      let data;
      switch (selectedReport) {
        case 'sales':
          data = await reportsService.getSalesReport(filters);
          setReportData(prev => ({ ...prev, sales: data }));
          break;
        case 'inventory':
          data = await reportsService.getInventoryReport();
          setReportData(prev => ({ ...prev, inventory: data }));
          break;
        case 'profit':
          data = await reportsService.getProfitReport(dateFrom, dateTo);
          setReportData(prev => ({ ...prev, profit: data }));
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const filters = {
        period: selectedPeriod,
        dateFrom: selectedPeriod === 'custom' ? dateFrom : undefined,
        dateTo: selectedPeriod === 'custom' ? dateTo : undefined
      };
      
      await reportsService.downloadReport(selectedReport, filters);
      alert('Report downloaded successfully!');
    } catch (err) {
      alert('Failed to download report: ' + err.message);
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
              <TrendingUp className="w-3 h-3 mr-1" />
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
    if (!salesData) return <div>Loading sales data...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={`₦${salesData.totalSales.toLocaleString()}`}
            icon={DollarSign}
            change="+12.5% from last month"
            changeType="positive"
          />
          <StatCard
            title="Transactions"
            value={salesData.totalTransactions.toLocaleString()}
            icon={ShoppingCart}
            change="+8.3% from last month"
            changeType="positive"
          />
          <StatCard
            title="Avg. Transaction"
            value={`₦${salesData.avgTransactionValue.toLocaleString()}`}
            icon={Activity}
            change="+3.7% from last month"
            changeType="positive"
          />
          <StatCard
            title="Active Products"
            value="156"
            icon={Package}
            change="+2 new products"
            changeType="positive"
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
                    const percentage = (product.revenue / salesData.totalSales) * 100;
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
                                className="bg-teal-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
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
                <p className="text-sm text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InventoryReportTab = () => {
    const inventoryData = reportData.inventory;
    if (!inventoryData) return <div>Loading inventory data...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            icon={Activity}
            bgColor="bg-red-50"
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
                    const percentage = (category.value / inventoryData.totalValue) * 100;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">{category.name}</td>
                        <td className="py-3">{category.count}</td>
                        <td className="py-3 font-medium">₦{category.value.toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
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
    if (!profitData) return <div>Loading profit data...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Profit"
            value={`₦${profitData.grossProfit.toLocaleString()}`}
            icon={TrendingUp}
            change="+15.2% from last month"
            changeType="positive"
          />
          <StatCard
            title="Net Profit"
            value={`₦${profitData.netProfit.toLocaleString()}`}
            icon={DollarSign}
            change="+12.8% from last month"
            changeType="positive"
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
                    const contribution = (product.profit / profitData.grossProfit) * 100;
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
                        <td className="py-3 font-medium text-green-600">₦{product.profit.toLocaleString()}</td>
                        <td className="py-3">{product.margin}%</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${contribution}%` }}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your business performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Export'}
          </button>
        </div>
      </div>

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
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

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

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Export Sales Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Download detailed sales transactions</p>
          <button className="w-full px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
            Export CSV
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <Package className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium">Inventory Valuation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Current inventory worth and breakdown</p>
          <button 
            onClick={() => setSelectedReport('inventory')}
            className="w-full px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50"
          >
            View Report
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-medium">P&L Statement</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Comprehensive profit and loss analysis</p>
          <button 
            onClick={() => setSelectedReport('profit')}
            className="w-full px-3 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;