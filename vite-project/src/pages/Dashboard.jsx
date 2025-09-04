import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  Store,
  Scan,
  CreditCard,
  TrendingUp,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Eye,
  Calendar,
  DollarSign,
  Package2,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Filter,
  Download,
  Upload,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  MoreVertical,
  Receipt,
  Save,
  Calculator,
  Percent,
  User,
  Activity,
  PieChart
} from 'lucide-react';

// Import individual page components (these would be separate files in real implementation)
// For demo purposes, we'll include simplified versions here

const Dashboard = ({ onNavigate }) => {

  const dashboardStats = {
    todaySales: { value: '₦0.00', count: 0 },
    expired: { value: 0 },
    todayInvoice: { value: 0 },
    newProducts: { value: 4 },
    suppliers: { value: 0 },
    invoices: { value: 0 },
    currentMonthSales: { value: '₦0.00' },
    lastMonthRecord: { value: '0.00' },
    lastMonthSales: { value: '₦0.00' },
    users: { value: 1 },
    availableProducts: { value: 4 },
    currentYearRevenue: { value: '₦0.00' },
    stores: { value: 1 }
  };

  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <button className="mt-4 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity">
        VIEW
      </button>
    </div>
  );

  const SmallStatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today Sales"
          value={dashboardStats.todaySales.value}
          icon={DollarSign}
          bgColor="bg-slate-800"
        />
        <StatCard
          title="Expired"
          value={dashboardStats.expired.value}
          icon={AlertTriangle}
          bgColor="bg-cyan-800"
        />
        <StatCard
          title="Today Invoice"
          value={dashboardStats.todayInvoice.value}
          icon={FileText}
          bgColor="bg-slate-500"
        />
        <StatCard
          title="New Products"
          value={dashboardStats.newProducts.value}
          icon={Package}
          bgColor="bg-cyan-600"
        />
      </div>

      {/* Small Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <SmallStatCard
          label="Suppliers"
          value={dashboardStats.suppliers.value}
          icon={Users}
          color="bg-orange-500"
        />
        <SmallStatCard
          label="Invoices"
          value={dashboardStats.invoices.value}
          icon={FileText}
          color="bg-pink-500"
        />
        <SmallStatCard
          label="Current Month Sales"
          value={dashboardStats.currentMonthSales.value}
          icon={ShoppingBag}
          color="bg-purple-500"
        />
        <SmallStatCard
          label="Users"
          value={dashboardStats.users.value}
          icon={Users}
          color="bg-blue-400"
        />
        <SmallStatCard
          label="Available Products"
          value={dashboardStats.availableProducts.value}
          icon={Package}
          color="bg-orange-400"
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
          onClick={() => onNavigate('sales')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center mb-3">
            <ShoppingCart className="w-8 h-8 text-teal-600 mr-3" />
            <div>
              <h3 className="font-semibold">Make a Sale</h3>
              <p className="text-sm text-gray-600">Process new transactions</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('products')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center mb-3">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-gray-600">Add or edit inventory</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('reports')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center mb-3">
            <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
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
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
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
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No recent transactions
                    {/* Backend: GET /api/transactions/recent */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Products Management</h2>
      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center">
        <Plus className="w-4 h-4 mr-2" />
        Add Product
      </button>
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
          <p className="text-sm text-gray-400">Add your first product to get started</p>
          {/* Backend: GET /api/products */}
        </div>
      </div>
    </div>
  </div>
);

const Sales = () => (
  <div className="h-full flex">
    {/* Products Panel */}
    <div className="flex-1 bg-white rounded-lg border border-gray-200 mr-4">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products available</p>
          {/* Backend: GET /api/products/active */}
        </div>
      </div>
    </div>

    {/* Cart Panel */}
    <div className="w-96 bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart (0)
        </h3>
      </div>
      
      <div className="p-4 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Cart is empty</p>
      </div>
    </div>
  </div>
);

const Inventory = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Inventory Management</h2>
      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
        Stock Adjustment
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Package className="w-8 h-8 text-blue-600" />
          <div className="ml-3">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <div className="ml-3">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <div className="ml-3">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-xl font-semibold">₦0</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Package className="w-8 h-8 text-purple-600" />
          <div className="ml-3">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No inventory data</p>
        {/* Backend: GET /api/inventory */}
      </div>
    </div>
  </div>
);

const Reports = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Reports & Analytics</h2>
      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
        <Download className="w-4 h-4 mr-2 inline" />
        Export
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h3 className="font-semibold">Sales Report</h3>
            <p className="text-sm text-gray-600">Track sales performance</p>
          </div>
        </div>
        <button className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
          View Report
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <Package className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h3 className="font-semibold">Inventory Report</h3>
            <p className="text-sm text-gray-600">Stock levels and valuation</p>
          </div>
        </div>
        <button className="w-full px-4 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50">
          View Report
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h3 className="font-semibold">Profit & Loss</h3>
            <p className="text-sm text-gray-600">Financial performance</p>
          </div>
        </div>
        <button className="w-full px-4 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50">
          View Report
        </button>
      </div>
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No report data available</p>
        {/* Backend: GET /api/reports/summary */}
      </div>
    </div>
  </div>
);

// Main App Component
const SERMSApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, component: Dashboard },
    { name: 'Products', icon: Package, component: Products },
    { name: 'Sales', icon: ShoppingCart, component: Sales },
    { name: 'Inventory', icon: Package2, component: Inventory },
    { name: 'Reports', icon: BarChart3, component: Reports },
    { name: 'Users', icon: Users },
    { name: 'Suppliers', icon: Users },
    { name: 'Settings', icon: Settings }
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
              <p className="text-sm text-gray-400 mt-2">
                Backend integration needed for full functionality
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SERMSApp;