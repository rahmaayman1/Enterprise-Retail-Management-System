// services/inventoryService.js
import apiClient from './api';

export const inventoryService = {
  
  getAllInventory: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/inventory${query ? `?${query}` : ''}`);
  },

  
  getLowStockProducts: async () => {
    return apiClient.request('/inventory/low-stock');
  },

  
  getOutOfStockProducts: async () => {
    return apiClient.request('/inventory/out-of-stock');
  },

  
  updateProductStock: async (productId, quantity, type, reason) => {
    return apiClient.request('/inventory/update-stock', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, type, reason })
    });
  },

  
  performStockCount: async (countData) => {
    return apiClient.request('/inventory/stock-count', {
      method: 'POST',
      body: JSON.stringify(countData)
    });
  },

  
  getStockMovements: async (productId, filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/inventory/movements/${productId}${query ? `?${query}` : ''}`);
  }
};