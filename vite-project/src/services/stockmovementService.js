// services/stockMovementsService.js
import apiClient from './api';

export const stockMovementsService = {
  // جلب كل حركات المخزون
  getAllMovements: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/stock-movements${query ? `?${query}` : ''}`);
  },

  // جلب حركة بالـ ID
  getMovementById: async (id) => {
    return apiClient.request(`/stock-movements/${id}`);
  },

  // إنشاء حركة مخزون جديدة
  createMovement: async (movementData) => {
    return apiClient.request('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  },

  // جلب حركات المخزون لمنتج معين
  getMovementsByProduct: async (productId) => {
    return apiClient.request(`/stock-movements/product/${productId}`);
  },

  // جلب حركات المخزون لفترة معينة
  getMovementsByDateRange: async (startDate, endDate) => {
    return apiClient.request(`/stock-movements/date-range?start=${startDate}&end=${endDate}`);
  }
};