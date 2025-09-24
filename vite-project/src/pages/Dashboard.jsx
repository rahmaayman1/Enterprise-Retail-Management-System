
//  Dashboard.jsx 
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  Store,
  Bell,
  Menu,
  X,
  Calendar,
  DollarSign,
  Package2,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  LogOut
} from 'lucide-react';

// Import services
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { userService } from '../services/userService';
import { vendorService } from '../services/vendorService';

import Products from "./Products";
import Sales from "./Sales";
import Inventory from "./Inventory";
import Reports from "./Reports";
import Purchase from "./Purchase";
import UsersPage from "./Users";
import SettingsPage from "./Settings";



const Dashboard = ({ onNavigate }) => {
  const [dashboardStats, setDashboardStats] = useState({
    todaySales: { value: '₦0.00', count: 0 },
    expired: { value: 0 },
    todayInvoice: { value: 0 },
    newProducts: { value: 0 },
    suppliers: { value: 0 },
    invoices: { value: 0 },
    currentMonthSales: { value: '₦0.00' },
    lastMonthSales: { value: '₦0.00' },
    users: { value: 0 },
    availableProducts: { value: 0 },
    currentYearRevenue: { value: '₦0.00' },
    stores: { value: 1 },
    lowStockCount: { value: 0 }
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        statsData,
        todaySalesData,
        recentTransactionsData,
        productsData,
        usersData,
        vendorsData
      ] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        salesService.getTodaySales(),
        dashboardService.getRecentTransactions(5),
        productService.getAllProducts(),
        userService.getAllUsers(),
        vendorService.getAllVendors()
      ]);

      // Process stats data
      if (statsData.status === 'fulfilled' && statsData.value) {
        const stats = statsData.value;
        setDashboardStats(prevStats => ({
          ...prevStats,
          todaySales: { 
            value: `₦${stats.todaySalesAmount?.toLocaleString() || '0.00'}`,
            count: stats.todaySalesCount || 0
          },
          todayInvoice: { value: stats.todayInvoicesCount || 0 },
          currentMonthSales: { 
            value: `₦${stats.currentMonthSales?.toLocaleString() || '0.00'}`
          },
          lastMonthSales: { 
            value: `₦${stats.lastMonthSales?.toLocaleString() || '0.00'}`
          },
          currentYearRevenue: { 
            value: `₦${stats.currentYearRevenue?.toLocaleString() || '0.00'}`
          },
          lowStockCount: { value: stats.lowStockCount || 0 }
        }));
      }

      // Process products data
      if (productsData.status === 'fulfilled' && Array.isArray(productsData.value)) {
        const products = productsData.value;
        const activeProducts = products.filter(p => p.isActive !== false);
        const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);
        
        setDashboardStats(prevStats => ({
          ...prevStats,
          availableProducts: { value: activeProducts.length },
          newProducts: { value: products.filter(p => {
            const createdDate = new Date(p.createdAt);
            const today = new Date();
            const diffTime = Math.abs(today - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7; // Products created in last 7 days
          }).length },
          lowStockCount: { value: lowStockProducts.length }
        }));
      }

      // Process users data
      if (usersData.status === 'fulfilled' && Array.isArray(usersData.value)) {
        setDashboardStats(prevStats => ({
          ...prevStats,
          users: { value: usersData.value.length }
        }));
      }

      // Process vendors data
      if (vendorsData.status === 'fulfilled' && Array.isArray(vendorsData.value)) {
        const activeVendors = vendorsData.value.filter(v => v.isActive !== false);
        setDashboardStats(prevStats => ({
          ...prevStats,
          suppliers: { value: activeVendors.length }
        }));
      }

      // Process recent transactions
      if (recentTransactionsData.status === 'fulfilled' && Array.isArray(recentTransactionsData.value)) {
        setRecentTransactions(recentTransactionsData.value);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, onClick, trend }) => (
    <div 
      className={`${bgColor} rounded-lg p-6 text-white relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow-transform`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-xs opacity-90">{trend.percentage}%</span>
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <button className="mt-4 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity">
        VIEW DETAILS
      </button>
    </div>
  );

  const SmallStatCard = ({ label, value, icon: Icon, color, onClick, isAlert }) => (
    <div 
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${
        isAlert ? 'border-l-4 border-l-red-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-lg font-semibold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );

  const TransactionRow = ({ transaction }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4">
        <span className="font-medium text-gray-900">
          {transaction.invoiceNo || transaction._id?.slice(-8)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-gray-700">
          {transaction.customer?.name || transaction.customerName || 'Walk-in Customer'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="font-semibold text-gray-900">
          ₦{transaction.grandTotal?.toLocaleString() || '0.00'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          transaction.status === 'POSTED' 
            ? 'bg-green-100 text-green-800' 
            : transaction.status === 'CANCELLED'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {transaction.status || 'COMPLETED'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">
          {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
        </span>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Dashboard Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={dashboardStats.todaySales.value}
          icon={DollarSign}
          bgColor="bg-slate-800"
          onClick={() => onNavigate('Sales')}
        />
        <StatCard
          title="Today's Invoices"
          value={dashboardStats.todayInvoice.value}
          icon={FileText}
          bgColor="bg-slate-500"
          onClick={() => onNavigate('Sales')}
        />
        <StatCard
          title="New Products"
          value={dashboardStats.newProducts.value}
          icon={Package}
          bgColor="bg-cyan-600"
          onClick={() => onNavigate('Products')}
        />
      </div>

      {/* Small Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <SmallStatCard
          label="Suppliers"
          value={dashboardStats.suppliers.value}
          icon={Users}
          color="bg-orange-500"
          onClick={() => onNavigate('Purchase')}
        />
        <SmallStatCard
          label="Low Stock Items"
          value={dashboardStats.lowStockCount.value}
          icon={AlertTriangle}
          color="bg-red-500"
          onClick={() => onNavigate('Inventory')}
          isAlert={dashboardStats.lowStockCount.value > 0}
        />
        <SmallStatCard
          label="Current Month Sales"
          value={dashboardStats.currentMonthSales.value}
          icon={ShoppingBag}
          color="bg-purple-500"
          onClick={() => onNavigate('Reports')}
        />
        <SmallStatCard
          label="Users"
          value={dashboardStats.users.value}
          icon={Users}
          color="bg-blue-400"
          onClick={() => onNavigate('Users')}
        />
        <SmallStatCard
          label="Available Products"
          value={dashboardStats.availableProducts.value}
          icon={Package}
          color="bg-orange-400"
          onClick={() => onNavigate('Products')}
        />
        <SmallStatCard
          label="Stores"
          value={dashboardStats.stores.value}
          icon={Store}
          color="bg-blue-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => onNavigate('Sales')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center mb-3">
            <ShoppingCart className="w-8 h-8 text-teal-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-semibold">Make a Sale</h3>
              <p className="text-sm text-gray-600">Process new transactions</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('Products')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center mb-3">
            <Package className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-gray-600">Add or edit inventory</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('Reports')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center mb-3">
            <BarChart3 className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-semibold">View Reports</h3>
              <p className="text-sm text-gray-600">Analyze performance</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <button 
              onClick={() => onNavigate('Sales')}
              className="text-teal-600 hover:text-teal-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ORDER ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">CUSTOMER</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">AMOUNT</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">STATUS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <TransactionRow key={transaction._id} transaction={transaction} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No recent transactions found</p>
                      <button 
                        onClick={() => onNavigate('Sales')}
                        className="mt-2 text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        Make your first sale
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {dashboardStats.lowStockCount.value > 0 && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">
                Low Stock Alert!
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {dashboardStats.lowStockCount.value} products need restocking
              </p>
              <button 
                onClick={() => onNavigate('Inventory')}
                className="mt-2 text-xs text-orange-800 hover:text-orange-900 underline"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component remains the same...
const SERMSApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, component: Dashboard },
    { name: 'Products', icon: Package, component: Products },
    { name: 'Sales', icon: ShoppingCart, component: Sales },
    { name: 'Inventory', icon: Package2, component: Inventory },
    { name: 'Reports', icon: BarChart3, component: Reports },
    { name: 'Users', icon: Users, component: UsersPage},
    { name: 'Purchase', icon: ShoppingBag, component: Purchase },
    { name: 'Settings', icon: Settings, component: SettingsPage }
  ];

  const currentMenuItem = sidebarItems.find(item => item.name === activeMenu);
  const CurrentComponent = currentMenuItem?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-cyan-950 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-teal-500">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-800 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <h2 className="font-bold text-sm text-gray-200">SAMA ENTERPRISE</h2>
                <p className="text-xs text-teal-200">Retail Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === item.name 
                      ? 'bg-teal-700 text-white' 
                      : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-teal-500">
          <button className="w-full flex items-center px-3 py-2 rounded-lg text-teal-100 hover:bg-teal-700 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                {activeMenu}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Administrator</span>
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {CurrentComponent ? (
            <CurrentComponent onNavigate={setActiveMenu} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{activeMenu}</h3>
              <p className="text-gray-500">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SERMSApp;