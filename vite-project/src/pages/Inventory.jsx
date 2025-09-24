import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Minus,
  Eye,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';

// Import real services
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { stockMovementsService } from '../services/stockmovementService';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([
      fetchInventoryData(),
      fetchStockMovements(),
      fetchCategories()
    ]);
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get products with their current stock levels
      const products = await productService.getAllProducts();
      
      if (Array.isArray(products)) {
        // Transform products data to inventory format
        const inventoryData = products.map(product => ({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          category: typeof product.category === 'object' ? product.category.name : product.category || 'Uncategorized',
          currentStock: product.quantity || 0,
          reorderLevel: product.reorderLevel || 0,
          maxStock: Math.max((product.reorderLevel || 0) * 3, 100), // Estimate max stock
          avgCost: product.costPrice || 0,
          salePrice: product.salePrice || 0,
          lastUpdated: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A',
          vendor: typeof product.vendor === 'object' ? product.vendor.name : product.vendor || 'N/A'
        }));
        
        setInventory(inventoryData);
      }
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const movements = await stockMovementsService.getAllMovements({ limit: 50 });
      if (Array.isArray(movements)) {
        const formattedMovements = movements.map(movement => ({
          _id: movement._id,
          productId: movement.product._id,
          productName: movement.product.name,
          type: movement.direction === 'IN' ? 'in' : 'out',
          quantity: movement.direction === 'IN' ? movement.qty : -movement.qty,
          reason: movement.reason,
          date: new Date(movement.createdAt).toLocaleDateString(),
          createdBy: movement.createdBy?.name || 'System'
        }));
        setStockMovements(formattedMovements);
      }
    } catch (err) {
      console.error('Error fetching stock movements:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      // Get unique categories from products
      const uniqueCategories = [...new Set(inventory.map(item => item.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error processing categories:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const StockAdjustmentModal = () => {
    const [adjustmentType, setAdjustmentType] = useState('increase');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const handleAdjustment = async () => {
      if (!selectedProduct || !quantity || !reason) {
        alert('Please fill all required fields');
        return;
      }

      const adjustmentQuantity = adjustmentType === 'increase' ? parseInt(quantity) : parseInt(quantity);
      
      const adjustmentData = {
        product: selectedProduct._id,
        direction: adjustmentType === 'increase' ? 'IN' : 'OUT',
        reason: 'ADJUSTMENT',
        qty: adjustmentQuantity,
        unitCost: selectedProduct.avgCost,
        refType: 'Manual',
        beforeQty: selectedProduct.currentStock,
        afterQty: adjustmentType === 'increase' 
          ? selectedProduct.currentStock + adjustmentQuantity
          : selectedProduct.currentStock - adjustmentQuantity,
        notes: `${reason}${notes ? ` - ${notes}` : ''}`
      };

      try {
        setAdjustmentLoading(true);
        
        // Create stock movement record
        await stockMovementsService.createMovement(adjustmentData);
        
        // Update local inventory state
        setInventory(prev => prev.map(item => 
          item._id === selectedProduct._id 
            ? { 
                ...item, 
                currentStock: adjustmentData.afterQty,
                lastUpdated: new Date().toLocaleDateString()
              }
            : item
        ));

        // Refresh stock movements
        await fetchStockMovements();

        alert(`Stock adjustment completed successfully!\nProduct: ${selectedProduct.name}\nAdjustment: ${adjustmentType === 'increase' ? '+' : '-'}${quantity}`);
        
        setShowAdjustmentModal(false);
        setQuantity('');
        setReason('');
        setNotes('');
        setSelectedProduct(null);
        
      } catch (error) {
        console.error('Stock adjustment error:', error);
        alert('Failed to process stock adjustment: ' + (error.message || 'Unknown error'));
      } finally {
        setAdjustmentLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Stock Adjustment</h2>
            <button 
              onClick={() => setShowAdjustmentModal(false)}
              className="text-gray-400 hover:text-gray-600"
              disabled={adjustmentLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedProduct && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
              <p className="text-sm text-gray-600">Current Stock: <span className="font-medium">{selectedProduct.currentStock}</span></p>
              <p className="text-sm text-gray-600">Reorder Level: {selectedProduct.reorderLevel}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdjustment(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('increase')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    adjustmentType === 'increase' 
                      ? 'bg-green-100 border-green-600 text-green-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={adjustmentLoading}
                >
                  <ArrowUpCircle className="w-4 h-4 mr-1" />
                  Increase
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('decrease')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    adjustmentType === 'decrease' 
                      ? 'bg-red-100 border-red-600 text-red-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={adjustmentLoading}
                >
                  <ArrowDownCircle className="w-4 h-4 mr-1" />
                  Decrease
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={adjustmentType === 'decrease' ? selectedProduct?.currentStock : undefined}
                required
                disabled={adjustmentLoading}
              />
              {adjustmentType === 'decrease' && parseInt(quantity) > selectedProduct?.currentStock && (
                <p className="text-red-500 text-xs mt-1">Cannot decrease more than current stock</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={adjustmentLoading}
              >
                <option value="">Select reason</option>
                <option value="Damaged goods">Damaged goods</option>
                <option value="Lost items">Lost items</option>
                <option value="Found items">Found items</option>
                <option value="Returned items">Returned items</option>
                <option value="Stock count adjustment">Stock count adjustment</option>
                <option value="Expired products">Expired products</option>
                <option value="Transfer adjustment">Transfer adjustment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                placeholder="Optional additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                disabled={adjustmentLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={adjustmentLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={adjustmentLoading || (adjustmentType === 'decrease' && parseInt(quantity) > selectedProduct?.currentStock)}
              >
                {adjustmentLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Adjustment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const StockLevelIndicator = ({ current, reorder, max }) => {
    const percentage = Math.min((current / max) * 100, 100);
    let color = 'bg-green-500';
    if (current <= reorder) color = 'bg-red-500';
    else if (percentage <= 30) color = 'bg-yellow-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const InventoryRow = ({ item }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">{item.sku}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {item.category}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${
              item.currentStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'
            }`}>
              {item.currentStock}
            </span>
            <span className="text-xs text-gray-500">/ {item.maxStock}</span>
          </div>
          <StockLevelIndicator 
            current={item.currentStock} 
            reorder={item.reorderLevel} 
            max={item.maxStock} 
          />
          <div className="text-xs text-gray-500">
            Reorder: {item.reorderLevel}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.currentStock <= item.reorderLevel 
            ? 'bg-red-100 text-red-800' 
            : item.currentStock <= (item.maxStock * 0.3)
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
        }`}>
          {item.currentStock <= item.reorderLevel ? 'Low Stock' : 
           item.currentStock <= (item.maxStock * 0.3) ? 'Medium' : 'Good'}
        </span>
      </td>
      <td className="py-3 px-4">₦{item.avgCost.toLocaleString()}</td>
      <td className="py-3 px-4">₦{((item.currentStock * item.avgCost) || 0).toLocaleString()}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{item.lastUpdated}</td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setSelectedProduct(item);
              setShowAdjustmentModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Adjust Stock"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              // Navigate to product details or show details modal
              alert(`Product Details:\nName: ${item.name}\nSKU: ${item.sku}\nVendor: ${item.vendor}`);
            }}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const MovementRow = ({ movement }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-gray-900">{movement.productName}</p>
          <p className="text-sm text-gray-500">ID: {movement.productId}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          {movement.type === 'in' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 text-red-600 mr-2" />
          )}
          <span className={`font-medium capitalize ${
            movement.type === 'in' ? 'text-green-600' : 'text-red-600'
          }`}>
            {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`font-medium ${
          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {movement.quantity > 0 ? '+' : ''}{Math.abs(movement.quantity)}
        </span>
      </td>
      <td className="py-3 px-4">{movement.date}</td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{movement.reason}</span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">{movement.createdBy}</td>
    </tr>
  );

  // Enhanced filtering
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'low' && item.currentStock <= item.reorderLevel) ||
      (statusFilter === 'good' && item.currentStock > item.reorderLevel);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel);
  const outOfStockItems = inventory.filter(item => item.currentStock === 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.avgCost), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.currentStock, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading inventory...</p>
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
            <h3 className="text-lg font-medium text-red-800">Error Loading Inventory</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchInventoryData}
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your stock levels</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-semibold">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Low Stock Alert</p>
              <p className="text-xl font-semibold text-red-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold">₦{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-xl font-semibold">{inventory.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Levels
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'movements'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Movements
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Low Stock Alerts ({lowStockItems.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'stock' && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products or SKU..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="good">Good Stock</option>
                    <option value="low">Low Stock</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {filteredInventory.length} of {inventory.length} products
                </div>
              </div>

              {/* Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Stock Level</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Unit Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <InventoryRow key={item._id} item={item} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No inventory items found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'movements' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4">Recent Stock Movements</h3>
                <p className="text-sm text-gray-600">Showing the latest 50 stock movements</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Movement Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.length > 0 ? (
                      stockMovements.map((movement) => (
                        <MovementRow key={movement._id} movement={movement} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">
                          <ArrowUpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No stock movements found</p>
                          <p className="text-sm text-gray-400">Stock movements will appear here when you make adjustments</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'alerts' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4 text-red-600 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Low Stock Alerts
                </h3>
                {lowStockItems.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">No low stock alerts!</p>
                    <p className="text-sm text-gray-400">All products are above their reorder levels</p>
                  </div>
                )}
              </div>
              {lowStockItems.length > 0 && (
                <>
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <div>
                        <p className="font-medium text-red-800">
                          {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} restocking
                        </p>
                        <p className="text-sm text-red-600">
                          {outOfStockItems.length > 0 && `${outOfStockItems.length} completely out of stock`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-red-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Reorder Level</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Suggested Order</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map((item) => (
                          <tr key={item._id} className="border-b border-gray-200 bg-red-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.sku}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                item.currentStock === 0 ? 'text-red-700' : 'text-red-600'
                              }`}>
                                {item.currentStock}
                                {item.currentStock === 0 && (
                                  <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">
                                    OUT OF STOCK
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4">{item.reorderLevel}</td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-blue-600">
                                {Math.max(item.maxStock - item.currentStock, item.reorderLevel * 2)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.currentStock === 0 
                                  ? 'bg-red-200 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.currentStock === 0 ? 'CRITICAL' : 'LOW'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setShowAdjustmentModal(true);
                                  }}
                                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                                >
                                  Adjust Stock
                                </button>
                                <button 
                                  onClick={() => {
                                    alert(`Purchase Order would be created for:\nProduct: ${item.name}\nSuggested Quantity: ${Math.max(item.maxStock - item.currentStock, item.reorderLevel * 2)}`);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Create PO
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && <StockAdjustmentModal />}
    </div>
  );
};

export default InventoryPage;