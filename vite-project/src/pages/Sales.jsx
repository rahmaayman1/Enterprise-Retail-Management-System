import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Scan, 
  User, 
  CreditCard, 
  DollarSign,
  Receipt,
  ShoppingCart,
  Calculator,
  Percent,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';

// Import real services
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { customerService } from '../services/customerService';
import { stockMovementsService } from '../services/stockmovementService';

const SalesPOSPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); 
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [heldTransactions, setHeldTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [lastSaleInfo, setLastSaleInfo] = useState(null);

  useEffect(() => {
    fetchProducts();
    loadHeldTransactions();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  useEffect(() => {
    if (customerSearch.length > 2) {
      searchCustomers();
    } else {
      setCustomers([]);
    }
  }, [customerSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    try {
      const data = await customerService.searchCustomers(customerSearch);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching customers:', err);
      setCustomers([]);
    }
  };

  const filterProducts = () => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
      );
      setFilteredProducts(filtered);
    }
  };

  const addToCart = (product) => {
    if (!product.quantity || product.quantity <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      if (existingItem.cartQuantity >= product.quantity) {
        alert('Cannot add more items. Stock limit reached!');
        return;
      }
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        cartQuantity: 1,
        unitPrice: product.salePrice,
        unitCost: product.costPrice
      }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find(p => p._id === id);
    if (product && newQuantity > product.quantity) {
      alert('Cannot exceed available stock!');
      return;
    }

    setCart(cart.map(item => 
      item._id === id ? { ...item, cartQuantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setDiscount(0);
    setAmountPaid(0);
    setShowCustomerSearch(false);
    setLastSaleInfo(null);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQuantity), 0);
  };

  const calculateDiscountAmount = () => {
    if (discountType === 'percentage') {
      return (calculateSubtotal() * discount) / 100;
    } else {
      return discount;
    }
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscountAmount());
  };

  const calculateChange = () => {
    return Math.max(0, amountPaid - calculateTotal());
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp.slice(-8)}-${random}`;
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    if (paymentMethod === 'CASH' && amountPaid < calculateTotal()) {
      alert('Insufficient payment amount!');
      return;
    }

    //check cart data integrity
    console.log('=== CHECKING CART DATA ===');
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      console.log(`Item ${i + 1}:`, {
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        cartQuantity: item.cartQuantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost || item.costPrice
      });
      
      if (!item._id) {
        alert(`Item ${i + 1}: Missing product ID`);
        return;
      }
      if (!item.cartQuantity || item.cartQuantity <= 0) {
        alert(`Item ${i + 1}: Invalid quantity`);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        alert(`Item ${i + 1}: Invalid price`);
        return;
      }
    }

    
    let branchId = null;
    let userId = null;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentBranch = JSON.parse(localStorage.getItem('currentBranch') || '{}');
      
      branchId = currentBranch._id || null;
      userId = currentUser._id || null;
      
      console.log('User ID:', userId);
      console.log('Branch ID:', branchId);
    } catch (error) {
      console.log('Could not get user/branch from localStorage, proceeding without them');
    }
    const saleData = {

      ...(branchId && { branch: branchId }),
      ...(userId && { createdBy: userId }),
      // Required fields 
      invoiceNo: generateInvoiceNumber(),
      customer: selectedCustomer?._id || null,
      date: new Date().toISOString(),
      
      // Items array 
      items: cart.map(item => ({
        product: item._id,
        qty: item.cartQuantity,
        unitPrice: item.unitPrice,
        unitCostAtSale: item.unitCost || item.costPrice,
        discount: 0,
        taxRate: 0
      })),

      // Totals
      subTotal: calculateSubtotal(),
      discountTotal: calculateDiscountAmount(),
      taxTotal: 0,
      shipping: 0,
      grandTotal: calculateTotal(),

      // Payment info
      paymentMethod: paymentMethod,
      paymentStatus: 'PAID',
      status: 'POSTED',

      // Notes if needed
      notes: ''
    };

    console.log('Sale Data being sent:', saleData); 

    try {
      setProcessing(true);
      setError(null);
      
      const result = await salesService.createSale(saleData);
      
      // Update product stock by creating stock movements
      for (const item of cart) {
        try {
          await stockMovementsService.createMovement({
            product: item._id,
            direction: 'OUT',
            reason: 'SALE',
            qty: item.cartQuantity,
            unitCost: item.unitCost || item.costPrice,
            refType: 'Sale',
            refId: result._id,
            beforeQty: item.quantity,
            afterQty: item.quantity - item.cartQuantity,
            notes: `Sale: ${result.invoiceNo}`
          });
        } catch (stockErr) {
          console.warn('Failed to create stock movement for product:', item._id, stockErr);
        }
      }

      setLastSaleInfo({
        invoiceNumber: result.invoiceNo || saleData.invoiceNo,
        total: calculateTotal(),
        change: calculateChange(),
        customer: selectedCustomer?.name || 'Walk-in Customer',
        timestamp: new Date().toLocaleString()
      });

      alert(`Sale processed successfully!\nInvoice: ${result.invoiceNo || saleData.invoiceNo}\nTotal: ₦${calculateTotal().toLocaleString()}`);
      
      clearCart();
      await fetchProducts(); // Refresh products to update stock levels
      
    } catch (error) {
      console.error('Sale processing error:', error);
      setError('Failed to process sale: ' + (error.message || 'Unknown error'));
      alert('Failed to process sale: ' + (error.message || 'Please try again'));
    } finally {
      setProcessing(false);
    }
  };
  const holdTransaction = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const transactionData = {
      id: Date.now().toString(),
      items: [...cart],
      customer: selectedCustomer,
      customerSearch: customerSearch,
      subtotal: calculateSubtotal(),
      discount: discount,
      discountType: discountType,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
      paymentMethod: paymentMethod
    };

    try {
      const updatedHeld = [...heldTransactions, transactionData];
      setHeldTransactions(updatedHeld);
      
      // Save to localStorage as backup
      localStorage.setItem('heldTransactions', JSON.stringify(updatedHeld));
      
      clearCart();
      alert('Transaction held successfully!');
    } catch (error) {
      console.error('Failed to hold transaction:', error);
      alert('Failed to hold transaction');
    }
  };

  const loadHeldTransactions = () => {
    try {
      const saved = localStorage.getItem('heldTransactions');
      if (saved) {
        setHeldTransactions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load held transactions:', error);
    }
  };

  const loadHeldTransaction = (transaction) => {
    setCart(transaction.items);
    setSelectedCustomer(transaction.customer);
    setCustomerSearch(transaction.customerSearch || '');
    setDiscount(transaction.discount);
    setDiscountType(transaction.discountType || 'percentage');
    setPaymentMethod(transaction.paymentMethod || 'CASH');
    
    // Remove from held transactions
    const updated = heldTransactions.filter(t => t.id !== transaction.id);
    setHeldTransactions(updated);
    localStorage.setItem('heldTransactions', JSON.stringify(updated));
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerSearch(false);
    setCustomers([]);
  };

  const ProductCard = ({ product }) => (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
      onClick={() => addToCart(product)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          (product.quantity || 0) > 10 
            ? 'bg-green-100 text-green-800' 
            : (product.quantity || 0) > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          Stock: {product.quantity || 0}
        </span>
      </div>
      <p className="text-lg font-bold text-teal-600">
        ₦{(product.salePrice || 0).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
      {product.category && (
        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {typeof product.category === 'object' ? product.category.name : product.category}
        </span>
      )}
    </div>
  );

  const CartItem = ({ item }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
        <p className="text-xs text-gray-500">₦{(item.unitPrice || 0).toLocaleString()} each</p>
      </div>
      <div className="flex items-center space-x-2 mx-3">
        <button 
          onClick={() => updateQuantity(item._id, item.cartQuantity - 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-2 py-1 bg-gray-100 rounded text-sm min-w-[2rem] text-center">
          {item.cartQuantity}
        </span>
        <button 
          onClick={() => updateQuantity(item._id, item.cartQuantity + 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button 
          onClick={() => removeFromCart(item._id)}
          className="p-1 rounded-full hover:bg-red-100 text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">
          ₦{((item.unitPrice || 0) * item.cartQuantity).toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchProducts}
              className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="Refresh Products"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Scan className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {lastSaleInfo && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <div className="text-sm">
                  <span className="font-medium text-green-800">Last Sale: {lastSaleInfo.invoiceNumber}</span>
                  <span className="text-green-600 ml-2">
                    ₦{lastSaleInfo.total.toLocaleString()} | {lastSaleInfo.customer}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart & Checkout */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cart.length})
            </h2>
            <button 
              onClick={clearCart}
              className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
              disabled={cart.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Customer</label>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search customer or leave empty for walk-in"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerSearch(true);
              }}
              onFocus={() => setShowCustomerSearch(true)}
            />
            
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-teal-800">{selectedCustomer.name}</p>
                    <p className="text-sm text-teal-600">{selectedCustomer.phone}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                    }}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Customer Search Results */}
            {showCustomerSearch && customers.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {customers.map(customer => (
                  <button
                    key={customer._id}
                    onClick={() => selectCustomer(customer)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Cart is empty</p>
              <p className="text-sm text-gray-400">Add products to start selling</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map(item => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            {/* Discount */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Discount
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₦</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? "100" : undefined}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount ({discountType === 'percentage' ? discount + '%' : '₦' + discount}):</span>
                  <span>-₦{calculateDiscountAmount().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    paymentMethod === 'CASH' 
                      ? 'bg-teal-100 border-teal-600 text-teal-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    paymentMethod === 'CARD' 
                      ? 'bg-teal-100 border-teal-600 text-teal-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </button>
              </div>
            </div>

            {/* Cash Payment Amount */}
            {paymentMethod === 'CASH' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Amount Paid</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
                {amountPaid >= calculateTotal() && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Change: ₦{calculateChange().toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={processSale}
                disabled={processing || (paymentMethod === 'CASH' && amountPaid < calculateTotal())}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Receipt className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Process Sale'}
              </button>
              
              <button 
                onClick={holdTransaction}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                disabled={processing}
              >
                <Save className="w-4 h-4 mr-2" />
                Hold Transaction
              </button>
            </div>

            {/* Held Transactions */}
            {heldTransactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Held Transactions: {heldTransactions.length}
                  </p>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {heldTransactions.map(transaction => (
                    <button
                      key={transaction.id}
                      onClick={() => loadHeldTransaction(transaction)}
                      className="w-full text-left p-2 bg-yellow-50 border border-yellow-200 rounded text-xs hover:bg-yellow-100"
                    >
                      <div className="flex justify-between">
                        <span>{transaction.customer?.name || 'Walk-in'}</span>
                        <span>₦{transaction.total.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-500">
                        {transaction.items.length} items • {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPOSPage;