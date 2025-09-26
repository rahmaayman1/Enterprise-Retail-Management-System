import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Save,
  X,
  Calendar,
  User,
  FileText,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Minus,
  Building
} from 'lucide-react';

// Import real services
import { purchaseService } from '../services/purchaseService';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import { stockMovementsService } from '../services/stockmovementService';

const PurchasePage = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([
      fetchPurchases(),
      fetchVendors(),
      fetchProducts()
    ]);
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseService.getAllPurchases();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch purchases');
      console.error('Error fetching purchases:', err);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
  try {
    const response = await vendorService.getActiveVendors(); 
    // لو الـ service بترجع object مع data
    const vendorsData = response?.data || response;

    if (Array.isArray(vendorsData)) {
      setVendors(vendorsData);
    } else {
      console.warn('Unexpected vendors response:', response);
      setVendors([]);
    }
  } catch (err) {
    console.error('Error fetching vendors:', err.response?.data || err.message);
    setVendors([]);
  }
};



  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPurchases();
    setRefreshing(false);
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;

    try {
      setActionLoading(true);
      await purchaseService.deletePurchase(purchaseId);
      setPurchases(purchases.filter(p => p._id !== purchaseId));
      alert('Purchase order deleted successfully!');
    } catch (err) {
      alert('Failed to delete purchase order: ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceived = async (purchaseId) => {
    if (!window.confirm('Confirm that all items have been received?')) return;

    try {
      setActionLoading(true);
      await purchaseService.confirmReceived(purchaseId);
      
      // Update local state
      setPurchases(purchases.map(p => 
        p._id === purchaseId 
          ? { ...p, status: 'POSTED', paymentStatus: 'PAID' }
          : p
      ));

      // Create stock movements for each item
      const purchase = purchases.find(p => p._id === purchaseId);
      if (purchase && purchase.items) {
        for (const item of purchase.items) {
          try {
            await stockMovementsService.createMovement({
              product: item.product._id || item.product,
              direction: 'IN',
              reason: 'PURCHASE',
              qty: item.qty,
              unitCost: item.unitCost,
              batchNo: item.batchNo,
              expiryDate: item.expiryDate,
              refType: 'Purchase',
              refId: purchaseId,
              notes: `Purchase: ${purchase.invoiceNo}`
            });
          } catch (stockErr) {
            console.warn('Failed to create stock movement:', stockErr);
          }
        }
      }

      alert('Purchase confirmed and stock updated!');
      await fetchPurchases(); // Refresh data
    } catch (err) {
      alert('Failed to confirm purchase: ' + (err.message || 'Unknown error'));
      console.error('Confirm error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const PurchaseModal = ({ isEdit = false, purchase = null, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      vendor: purchase?.vendor?._id || purchase?.vendor || '',
      invoiceNo: purchase?.invoiceNo || '',
      date: purchase?.date ? new Date(purchase.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: purchase?.items || [],
      subTotal: purchase?.subTotal || 0,
      discountTotal: purchase?.discountTotal || 0,
      taxTotal: purchase?.taxTotal || 0,
      shipping: purchase?.shipping || 0,
      grandTotal: purchase?.grandTotal || 0,
      paymentStatus: purchase?.paymentStatus || 'UNPAID',
      notes: purchase?.notes || ''
    });

    const [currentItem, setCurrentItem] = useState({
      product: '',
      qty: 1,
      unitCost: 0,
      discount: 0,
      taxRate: 0,
      batchNo: '',
      expiryDate: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const addItem = () => {
      if (!currentItem.product || !currentItem.qty || !currentItem.unitCost) {
        alert('Please fill product, quantity, and unit cost');
        return;
      }

      const product = products.find(p => p._id === currentItem.product);
      if (!product) {
        alert('Selected product not found');
        return;
      }

      const newItem = {
        ...currentItem,
        product: product,
        lineTotal: calculateLineTotal(currentItem)
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));

      setCurrentItem({
        product: '',
        qty: 1,
        unitCost: 0,
        discount: 0,
        taxRate: 0,
        batchNo: '',
        expiryDate: ''
      });

      // Recalculate totals
      setTimeout(() => calculateTotals(), 100);
    };

    const removeItem = (index) => {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      setTimeout(() => calculateTotals(), 100);
    };

    const calculateLineTotal = (item) => {
      const subtotal = item.qty * item.unitCost;
      const discountAmount = (subtotal * item.discount) / 100;
      const taxAmount = ((subtotal - discountAmount) * item.taxRate) / 100;
      return subtotal - discountAmount + taxAmount;
    };

    const calculateTotals = () => {
      const subTotal = formData.items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
      const discountTotal = formData.items.reduce((sum, item) => sum + ((item.qty * item.unitCost * item.discount) / 100), 0);
      const taxTotal = formData.items.reduce((sum, item) => {
        const itemSubtotal = item.qty * item.unitCost;
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        return sum + (((itemSubtotal - itemDiscount) * item.taxRate) / 100);
      }, 0);
      
      const grandTotal = subTotal - discountTotal + taxTotal + (formData.shipping || 0);

      setFormData(prev => ({
        ...prev,
        subTotal,
        discountTotal,
        taxTotal,
        grandTotal
      }));
    };

    const validateForm = () => {
      const errors = {};
      
      if (!formData.vendor) errors.vendor = 'Vendor is required';
      if (!formData.invoiceNo.trim()) errors.invoiceNo = 'Invoice number is required';
      if (formData.items.length === 0) errors.items = 'At least one item is required';
      if (!formData.date) errors.date = 'Date is required';

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      calculateTotals();

      const purchaseData = {
        branch: formData.branch?._id || formData.branch,
        vendor: formData.vendor?._id || formData.vendor,
        invoiceNo: formData.invoiceNo.trim(),
        date: new Date(formData.date).toISOString(),
        items: formData.items.map(item => ({
          product: item.product._id || item.product,
          qty: Number(item.qty),
          unitCost: Number(item.unitCost),
          discount: Number(item.discount) || 0,
          taxRate: Number(item.taxRate) || 0,
          batchNo: item.batchNo?.trim() || undefined,
          expiryDate: item.expiryDate || undefined
        })),
        subTotal: Number(formData.subTotal) || 0,
    discountTotal: Number(formData.discountTotal) || 0,
    taxTotal: Number(formData.taxTotal) || 0,
    shipping: Number(formData.shipping) || 0,
    grandTotal: Number(formData.grandTotal) || 0,
    
    paymentStatus: formData.paymentStatus || 'UNPAID',
    notes: formData.notes?.trim() || undefined
      };
      if (formData.branch) {
    purchaseData.branch = formData.branch;
  }
        if (!purchaseData.invoiceNo) {
    alert('Invoice number is required');
    return;
  }

  if (!purchaseData.vendor) {
    alert('Vendor is required');
    return;
  }

  if (!purchaseData.items || purchaseData.items.length === 0) {
    alert('At least one item is required');
    return;
  }

      try {
        setSubmitting(true);
        let result;
        
        if (isEdit && purchase) {
          result = await purchaseService.updatePurchase(purchase._id, purchaseData);
        } else {
          result = await purchaseService.createPurchase(purchaseData);
        }
        
        alert(`Purchase order ${isEdit ? 'updated' : 'created'} successfully!`);
        onSave?.();
        onClose();
        await fetchPurchases(); // Refresh the purchases list
      } catch (error) {
        console.error('Submit error:', error);
        alert(error.message || `Failed to ${isEdit ? 'update' : 'create'} purchase order`);
      } finally {
        setSubmitting(false);
      }
    };

    const generateInvoiceNo = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      setFormData(prev => ({ ...prev, invoiceNo: `PO-${random}-${timestamp}` }));
    };

    useEffect(() => {
      calculateTotals();
    }, [formData.items, formData.shipping]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.vendor ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {validationErrors.vendor && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.vendor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number *
                </label>
                <div className="flex">
                  <input 
                    type="text" 
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    className={`flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                      validationErrors.invoiceNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter invoice number"
                  />
                  <button 
                    type="button"
                    onClick={generateInvoiceNo}
                    className="px-3 py-2 bg-gray-500 text-white rounded-r-lg hover:bg-gray-600 text-sm"
                  >
                    Generate
                  </button>
                </div>
                {validationErrors.invoiceNo && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.invoiceNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.date && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.date}</p>
                )}
              </div>
            </div>

            {/* Add Item Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={currentItem.product}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={currentItem.qty}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, qty: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={currentItem.unitCost}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="100"
                    value={currentItem.discount}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch No.</label>
                  <input 
                    type="text"
                    value={currentItem.batchNo}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, batchNo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Product</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Qty</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Unit Cost</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Discount</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Line Total</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">{item.product.sku}</p>
                            </div>
                          </td>
                          <td className="py-2 px-3">{item.qty}</td>
                          <td className="py-2 px-3">₦{item.unitCost.toLocaleString()}</td>
                          <td className="py-2 px-3">{item.discount}%</td>
                          <td className="py-2 px-3 font-medium">₦{calculateLineTotal(item).toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <button 
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            {formData.items.length > 0 && (
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIAL">Partially Paid</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₦{formData.subTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₦{formData.discountTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₦{formData.taxTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <div className="flex items-center">
                        <span>₦</span>
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.shipping || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, shipping: Number(e.target.value) || 0 }))}
                          className="w-20 ml-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>₦{formData.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                disabled={submitting || formData.items.length === 0}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? 'Update Purchase' : 'Create Purchase'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PurchaseRow = ({ purchase }) => {
    const vendorName = typeof purchase.vendor === 'object' 
      ? purchase.vendor?.name 
      : vendors.find(v => v._id === purchase.vendor)?.name || 'Unknown Vendor';

    const statusColor = {
      'OPEN': 'bg-yellow-100 text-yellow-800',
      'POSTED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }[purchase.status] || 'bg-gray-100 text-gray-800';

    const paymentStatusColor = {
      'UNPAID': 'bg-red-100 text-red-800',
      'PARTIAL': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800'
    }[purchase.paymentStatus] || 'bg-gray-100 text-gray-800';

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div>
            <p className="font-medium text-gray-900">{purchase.invoiceNo}</p>
            <p className="text-sm text-gray-500">
              {new Date(purchase.date || purchase.createdAt).toLocaleDateString()}
            </p>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <Building className="w-4 h-4 text-gray-400 mr-2" />
            <span>{vendorName}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="font-medium">₦{(purchase.grandTotal || 0).toLocaleString()}</span>
        </td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
            {purchase.status}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusColor}`}>
            {purchase.paymentStatus}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm text-gray-600">
            {purchase.items?.length || 0} items
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            {purchase.status === 'OPEN' && (
              <button 
                onClick={() => handleConfirmReceived(purchase._id)}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="Confirm Received"
                disabled={actionLoading}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {
                setSelectedPurchase(purchase);
                setShowEditModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeletePurchase(purchase._id)}
              className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
              disabled={actionLoading}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Enhanced filtering
  const filteredPurchases = purchases.filter(purchase => {
    const vendorName = typeof purchase.vendor === 'object' 
      ? purchase.vendor?.name 
      : vendors.find(v => v._id === purchase.vendor)?.name || '';

    const matchesSearch = !searchTerm || [
      purchase.invoiceNo,
      vendorName,
      purchase.notes
    ].some(field => 
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    const matchesVendor = !vendorFilter || purchase.vendor === vendorFilter || 
      (typeof purchase.vendor === 'object' && purchase.vendor?._id === vendorFilter);

    return matchesSearch && matchesStatus && matchesVendor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Purchases</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchPurchases}
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
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600">Manage purchase orders and vendor relationships</p>
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
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-lg font-semibold text-gray-900">{purchases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {purchases.filter(p => p.status === 'OPEN').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {purchases.filter(p => p.status === 'POSTED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search purchase orders by invoice number, vendor, or notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="POSTED">Posted</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredPurchases.length} of {purchases.length} purchase orders
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <PurchaseRow key={purchase._id} purchase={purchase} />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {purchases.length === 0 ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</p>
                        <p className="text-sm text-gray-500 mb-4">Start by creating your first purchase order</p>
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 inline-flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Purchase Order
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders Found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setVendorFilter('');
                          }}
                          className="mt-3 px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 inline-flex items-center"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <PurchaseModal 
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Purchase Modal */}
      {showEditModal && selectedPurchase && (
        <PurchaseModal 
          isEdit={true}
          purchase={selectedPurchase}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPurchase(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedPurchase(null);
          }}
        />
      )}
    </div>
  );
};

export default PurchasePage;