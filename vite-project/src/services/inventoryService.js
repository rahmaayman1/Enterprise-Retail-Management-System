// services/inventoryService.js
import apiClient from './api';

export const inventoryService = {
  // جلب كل عناصر المخزون
  getAllInventory: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/inventory${query ? `?${query}` : ''}`);
  },

  // جلب المنتجات منخفضة المخزون
  getLowStockProducts: async () => {
    return apiClient.request('/inventory/low-stock');
  },

  // جلب المنتجات نافدة المخزون
  getOutOfStockProducts: async () => {
    return apiClient.request('/inventory/out-of-stock');
  },

  // تحديث مخزون منتج
  updateProductStock: async (productId, quantity, type, reason) => {
    return apiClient.request('/inventory/update-stock', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, type, reason })
    });
  },

  // جرد المخزون
  performStockCount: async (countData) => {
    return apiClient.request('/inventory/stock-count', {
      method: 'POST',
      body: JSON.stringify(countData)
    });
  },

  // تقرير حركة المخزون
  getStockMovements: async (productId, filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/inventory/movements/${productId}${query ? `?${query}` : ''}`);
  }
};