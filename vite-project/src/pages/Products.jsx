import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';

// Import real services
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { vendorService } from '../services/vendorService';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchVendors()
    ]);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getActiveCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getActiveVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setVendors([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setActionLoading(true);
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product: ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const ProductModal = ({ isEdit = false, product = null, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      sku: product?.sku || '',
      category: product?.category?._id || '',
      vendor: product?.vendor?._id || product?.vendor || '',
      costPrice: product?.costPrice || '',
      salePrice: product?.salePrice || '',
      quantity: product?.quantity || 0,
      reorderLevel: product?.reorderLevel || 0,
      barcode: product?.barcode || '',
      description: product?.description || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
      const errors = {};
      
      if (!formData.name.trim()) errors.name = 'Product name is required';
      if (!formData.sku.trim()) errors.sku = 'Product code is required';
      //if (!formData.category) errors.category = 'Category is required'; 
      if (!formData.costPrice || Number(formData.costPrice) < 0) errors.costPrice = 'Cost price is required and must be greater than zero';
      if (!formData.salePrice || Number(formData.salePrice) < 0) errors.salePrice = 'Selling price is required and must be greater than zero';
      if (Number(formData.salePrice) <= Number(formData.costPrice)) errors.salePrice = 'Selling price must be greater than cost price';
      if (Number(formData.quantity) < 0) errors.quantity = 'Quantity cannot be negative';
      if (Number(formData.reorderLevel) < 0) errors.reorderLevel = 'Reorder level cannot be negative';

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category|| undefined,
        vendor: formData.vendor || undefined,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        quantity: Number(formData.quantity),
        reorderLevel: Number(formData.reorderLevel),
        expiryDate: formData.expiryDate || undefined,
        barcode: formData.barcode.trim() || undefined,
        description: formData.description?.trim() || undefined
      };

      try {
        setSubmitting(true);
        let result;
        
        if (isEdit && product) {
          result = await productService.updateProduct(product._id, productData);
        } else {
          result = await productService.createProduct(productData);
        }
        
        alert(`Product ${isEdit ? 'updated' : 'added'} successfully!`);
        onSave?.();
        onClose();
        await fetchProducts(); // Refresh the products list
      } catch (error) {
        console.error('Submit error:', error);
        alert(error.message || `Failed to ${isEdit ? 'update' : 'add'} product`);
      } finally {
        setSubmitting(false);
      }
    };

    const generateSKU = () => {
      const timestamp = Date.now().toString().slice(-6);
      const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase();
      setFormData({...formData, sku: `PRD-${randomStr}-${timestamp}`});
    };

    const generateBarcode = () => {
      const barcode = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setFormData({...formData, barcode});
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code (SKU) *
                </label>
                <div className="flex">
                  <input 
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className={`flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                      validationErrors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={generateSKU}
                    className="px-3 py-2 bg-gray-500 text-white rounded-r-lg hover:bg-gray-600 text-sm"
                  >
                    Generate
                  </button>
                </div>
                {validationErrors.sku && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.sku}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
    value={formData.category || ''}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>

                {validationErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Vendor
                </label>
                <select
  value={formData.vendor || ''}
  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
>
  <option value="">Select Vendor</option>
  {vendors.map((vendor) => (
    <option key={vendor._id} value={vendor._id}>
      {vendor.name}
    </option>
  ))}
</select>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price *
                </label>
                <input 
                  type="number" 
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.costPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  step="0.01"
                  min="0"
                />
                {validationErrors.costPrice && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.costPrice}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <input 
                  type="number" 
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.salePrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  step="0.01"
                  min="0"
                />
                {validationErrors.salePrice && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.salePrice}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity
                </label>
                <input 
                  type="number" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {validationErrors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input 
                  type="number" 
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                    validationErrors.reorderLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {validationErrors.reorderLevel && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.reorderLevel}</p>
                )}
              </div>
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  placeholder="Leave empty for auto-generation"
                />
                <button 
                  type="button"
                  onClick={generateBarcode}
                  className="px-4 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                placeholder="Product description (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProductRow = ({ product }) => {
    const isLowStock = product.quantity <= product.reorderLevel;
    const categoryName = typeof product.category === 'object' 
    ? product.category?.name 
    : product.category || 'Not Set';
  const vendorName = typeof product.vendor === 'object' 
    ? product.vendor?.name 
    : product.vendor || 'Not Set';
    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">{product.sku}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {categoryName}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {product.quantity || 0}
            </span>
            {isLowStock && (
              <AlertCircle className="w-4 h-4 text-red-500 ml-1" title="Low Stock" />
            )}
          </div>
        </td>
        <td className="py-3 px-4">₦{product.salePrice?.toLocaleString()}</td>
        <td className="py-3 px-4">₦{product.costPrice?.toLocaleString()}</td>
        <td className="py-3 px-4">{vendorName}</td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            product.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : isLowStock
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.status === 'active' 
              ? 'Active' 
              : isLowStock 
              ? 'Low Stock' 
              : product.status || 'Not Set'
            }
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setSelectedProduct(product);
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
              onClick={() => handleDeleteProduct(product._id)}
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

  // Enhanced search and filter function
  const filteredProducts = products.filter(product => {
    // Text search in name, SKU, and description
    const matchesSearch = !searchTerm || [
      product.name,
      product.sku,
      product.description,
      product.category?.name || product.category,
      product.vendor?.name || product.vendor
    ].some(field => 
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Category filter
    const matchesCategory = !selectedCategory || 
      product.category?._id === selectedCategory || 
      product.category === selectedCategory;

    // Status filter
    const isLowStock = product.quantity <= product.reorderLevel;
    const productStatus = product.status === 'active' 
      ? 'active' 
      : isLowStock 
      ? 'low_stock' 
      : 'inactive';
    
    const matchesStatus = !statusFilter || productStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
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
            <h3 className="text-lg font-medium text-red-800">Error Loading Products</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchProducts}
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage product inventory</p>
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
            Export
          </button>
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products (name, code, description, category, supplier)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Results summary */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Selling Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cost Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductRow key={product._id} product={product} />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {products.length === 0 ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Products</p>
                        <p className="text-sm text-gray-500 mb-4">Start by adding your first product</p>
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 inline-flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Product
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Products Found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setStatusFilter('');
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

        {/* Pagination could be added here if needed */}
        {filteredProducts.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredProducts.length}</span> of{' '}
                <span className="font-medium">{products.length}</span> products
              </div>
              <div className="flex items-center space-x-2">
                {/* Add pagination controls here if needed */}
                <span className="text-xs text-gray-500">
                  {products.filter(p => p.quantity <= p.reorderLevel).length} products need reordering
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductModal 
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <ProductModal 
          isEdit={true}
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Low Stock Alert */}
      {products.filter(p => p.quantity <= p.reorderLevel).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">
                Warning: Low Stock
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {products.filter(p => p.quantity <= p.reorderLevel).length} products need reordering
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;