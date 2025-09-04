import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';


const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sample data - هنا هتحطي البيانات اللي جايه من الـ Backend
const [inventory, setInventory] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

  

  const StockAdjustmentModal = () => {
    const [adjustmentType, setAdjustmentType] = useState('increase');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllInventory();
      setInventory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchInventory();
}, []);


    const handleAdjustment = () => {
      if (!selectedProduct || !quantity || !reason) {
        alert('Please fill all fields');
        return;
      }

      const adjustmentQuantity = adjustmentType === 'increase' ? parseInt(quantity) : -parseInt(quantity);
      
      // Backend: POST /api/inventory/adjust
      
      const adjustmentData = {
        productId: selectedProduct.id,
        type: 'adjustment',
        quantity: adjustmentQuantity,
        reason: reason,
        date: new Date().toISOString()
      };

      console.log('Stock adjustment:', adjustmentData);

      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === selectedProduct.id 
          ? { 
              ...item, 
              currentStock: item.currentStock + adjustmentQuantity,
              movements: [
                { type: 'adjustment', quantity: adjustmentQuantity, date: new Date().toISOString().split('T')[0], reason },
                ...item.movements
              ]
            }
          : item
      ));

      setShowAdjustmentModal(false);
      setQuantity('');
      setReason('');
      setSelectedProduct(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Stock Adjustment</h2>
            <button 
              onClick={() => setShowAdjustmentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {selectedProduct && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">Current Stock: {selectedProduct.currentStock}</p>
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('increase')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    adjustmentType === 'increase' 
                      ? 'bg-green-100 border-green-600 text-green-700' 
                      : 'border-gray-300'
                  }`}
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
                      : 'border-gray-300'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4 mr-1" />
                  Decrease
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Damaged goods">Damaged goods</option>
                <option value="Lost items">Lost items</option>
                <option value="Found items">Found items</option>
                <option value="Returned items">Returned items</option>
                <option value="Stock count adjustment">Stock count adjustment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAdjustment}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const StockLevelIndicator = ({ current, reorder, max }) => {
    const percentage = (current / max) * 100;
    let color = 'bg-green-500';
    if (current <= reorder) color = 'bg-red-500';
    else if (percentage <= 30) color = 'bg-yellow-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
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
      <td className="py-3 px-4 text-sm text-gray-600">{item.lastUpdated}</td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setSelectedProduct(item);
              setShowAdjustmentModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-100 rounded">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const MovementRow = ({ movement, productName }) => (
    <tr className="border-b border-gray-200">
      <td className="py-3 px-4">{productName}</td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          {movement.type === 'in' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : movement.type === 'out' ? (
            <ArrowDownCircle className="w-4 h-4 text-red-600 mr-2" />
          ) : (
            <Edit className="w-4 h-4 text-blue-600 mr-2" />
          )}
          <span className="capitalize">{movement.type}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`font-medium ${
          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
        </span>
      </td>
      <td className="py-3 px-4">{movement.date}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{movement.reason}</td>
    </tr>
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel);
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.avgCost), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your stock levels</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
            {/* Backend: GET /api/inventory/export */}
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
              <p className="text-xl font-semibold">{inventory.reduce((sum, item) => sum + item.currentStock, 0)}</p>
              {/* Backend: GET /api/inventory/stats */}
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
                      placeholder="Search inventory..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Backend: GET /api/inventory for real data */}
                    {filteredInventory.map((item) => (
                      <InventoryRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'movements' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4">Recent Stock Movements</h3>
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
                    </tr>
                  </thead>
                  <tbody>
                    {/* Backend: GET /api/inventory/movements */}
                    {inventory.flatMap(item => 
                      item.movements.map(movement => (
                        <MovementRow 
                          key={`${item.id}-${movement.date}-${movement.type}`}
                          movement={movement} 
                          productName={item.name} 
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'alerts' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4 text-red-600">Low Stock Alerts</h3>
                {lowStockItems.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No low stock alerts</p>
                    <p className="text-sm text-gray-400">All products are above reorder level</p>
                  </div>
                )}
              </div>
              {lowStockItems.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reorder Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Suggested Order</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200 bg-red-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-red-600 font-medium">{item.currentStock}</span>
                          </td>
                          <td className="py-3 px-4">{item.reorderLevel}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{item.maxStock - item.currentStock}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700">
                              Create PO
                              {/* Backend: POST /api/purchase-orders/create */}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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