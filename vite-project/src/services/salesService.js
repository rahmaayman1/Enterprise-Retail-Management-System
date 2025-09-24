// services/salesService.js
import apiClient from './api';

export const salesService = {
  
  getAllSales: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/sales${query ? `?${query}` : ''}`);
  },

  
  getSaleById: async (id) => {
    return apiClient.request(`/sales/${id}`);
  },

  
  createSale: async (saleData) => {
    return apiClient.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData)
    });
  },


  updateSale: async (id, saleData) => {
    return apiClient.request(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData)
    });
  },

  
  deleteSale: async (id) => {
    return apiClient.request(`/sales/${id}`, {
      method: 'DELETE'
    });
  },


  getTodaySales: async () => {
    return apiClient.request('/sales/today');
  },

  
  getSalesByDateRange: async (startDate, endDate) => {
    return apiClient.request(`/sales/date-range?start=${startDate}&end=${endDate}`);
  },

  
  getSalesStats: async (period = 'month') => {
    return apiClient.request(`/sales/stats?period=${period}`);
  },

  
  cancelSale: async (id, reason) => {
    return apiClient.request(`/sales/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};