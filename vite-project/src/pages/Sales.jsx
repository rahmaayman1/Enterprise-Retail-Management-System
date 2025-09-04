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
  X
} from 'lucide-react';

// Simulated API services
const productService = {
  getAllProducts: () => Promise.resolve([
    { _id: '1', name: 'Samsung Galaxy S21', price: 25000, stock: 50, barcode: '1234567890123', category: 'Electronics' },
    { _id: '2', name: 'iPhone 13 Pro', price: 45000, stock: 25, barcode: '1234567890124', category: 'Electronics' },
    { _id: '3', name: 'Dell Laptop XPS 13', price: 85000, stock: 3, barcode: '1234567890125', category: 'Computers' },
    { _id: '4', name: 'Apple AirPods Pro', price: 15000, stock: 30, barcode: '1234567890126', category: 'Accessories' },
    { _id: '5', name: 'Sony Headphones', price: 8000, stock: 20, barcode: '1234567890127', category: 'Accessories' },
    { _id: '6', name: 'MacBook Pro M1', price: 125000, stock: 8, barcode: '1234567890128', category: 'Computers' }
  ]),
  searchProducts: (query) => {
    return productService.getAllProducts().then(products => 
      products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode.includes(query)
      )
    );
  }
};

const salesService = {
  processSale: (saleData) => Promise.resolve({
    ...saleData,
    _id: Date.now().toString(),
    invoiceNumber: `INV-${Date.now()}`,
    timestamp: new Date().toISOString()
  }),
  holdTransaction: (saleData) => Promise.resolve({
    ...saleData,
    _id: Date.now().toString(),
    status: 'held'
  })
};

const customerService = {
  searchCustomers: (query) => Promise.resolve([
    { _id: '1', name: 'Ahmed Hassan', phone: '01012345678' },
    { _id: '2', name: 'Sara Mohamed', phone: '01087654321' },
    { _id: '3', name: 'Mohamed Ali', phone: '01098765432' }
  ])
};

const SalesPOSPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [heldTransactions, setHeldTransactions] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async () => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      try {
        const filtered = await productService.searchProducts(searchTerm);
        setFilteredProducts(filtered);
      } catch (err) {
        console.error('Error searching products:', err);
      }
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Cannot add more items. Stock limit reached!');
        return;
      }
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find(p => p._id === id);
    if (product && newQuantity > product.stock) {
      alert('Cannot exceed available stock!');
      return;
    }

    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer('');
    setDiscount(0);
    setAmountPaid(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const calculateChange = () => {
    return Math.max(0, amountPaid - calculateTotal());
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    if (paymentMethod === 'cash' && amountPaid < calculateTotal()) {
      alert('Insufficient payment amount!');
      return;
    }

    const saleData = {
      items: cart,
      customer: customer,
      subtotal: calculateSubtotal(),
      discount: discount,
      discountAmount: calculateDiscountAmount(),
      total: calculateTotal(),
      paymentMethod: paymentMethod,
      amountPaid: amountPaid,
      change: calculateChange(),
      timestamp: new Date().toISOString()
    };

    try {
      setProcessing(true);
      const result = await salesService.processSale(saleData);
      alert(`Sale processed successfully! Invoice: ${result.invoiceNumber}`);
      clearCart();
    } catch (error) {
      alert('Failed to process sale: ' + error.message);
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
      items: cart,
      customer: customer,
      subtotal: calculateSubtotal(),
      discount: discount,
      total: calculateTotal()
    };

    try {
      const result = await salesService.holdTransaction(transactionData);
      setHeldTransactions([...heldTransactions, result]);
      clearCart();
      alert('Transaction held successfully!');
    } catch (error) {
      alert('Failed to hold transaction: ' + error.message);
    }
  };

  const ProductCard = ({ product }) => (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
      onClick={() => addToCart(product)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
        <span className={`text-xs ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
          Stock: {product.stock}
        </span>
      </div>
      <p className="text-lg font-bold text-teal-600">₦{product.price.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{product.barcode}</p>
      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
        {product.category}
      </span>
    </div>
  );

  const CartItem = ({ item }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex-1">
        <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
        <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => updateQuantity(item._id, item.quantity - 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-2 py-1 bg-gray-100 rounded text-sm min-w-[2rem] text-center">
          {item.quantity}
        </span>
        <button 
          onClick={() => updateQuantity(item._id, item.quantity + 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button 
          onClick={() => removeFromCart(item._id)}
          className="p-1 rounded-full hover:bg-red-100 text-red-600 ml-2"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="text-right ml-4">
        <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
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
                placeholder="Search products or scan barcode..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Scan className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {/* Customer Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Customer</label>
          </div>
          <input
            type="text"
            placeholder="Walk-in customer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
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
                  Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
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
                  <span>Discount ({discount}%):</span>
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
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    paymentMethod === 'cash' 
                      ? 'bg-teal-100 border-teal-600 text-teal-700' 
                      : 'border-gray-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
                    paymentMethod === 'card' 
                      ? 'bg-teal-100 border-teal-600 text-teal-700' 
                      : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </button>
              </div>
            </div>

            {/* Cash Payment Amount */}
            {paymentMethod === 'cash' && (
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
                  <p className="text-sm text-green-600 mt-1">
                    Change: ₦{calculateChange().toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={processSale}
                disabled={processing || (paymentMethod === 'cash' && amountPaid < calculateTotal())}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Process Sale'}
              </button>
              <button 
                onClick={holdTransaction}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Hold Transaction
              </button>
            </div>

            {/* Held Transactions */}
            {heldTransactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Held Transactions: {heldTransactions.length}
                </p>
                <button className="text-xs text-teal-600 hover:text-teal-700">
                  View Held Transactions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPOSPage;