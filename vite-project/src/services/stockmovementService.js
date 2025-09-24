// services/stockMovementsService.js
import apiClient from './api';

export const stockMovementsService = {
  
  getAllMovements: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/stock-movements${query ? `?${query}` : ''}`);
  },

  
  getMovementById: async (id) => {
    return apiClient.request(`/stock-movements/${id}`);
  },

  
  createMovement: async (movementData) => {
    return apiClient.request('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  },

  
  getMovementsByProduct: async (productId) => {
    return apiClient.request(`/stock-movements/product/${productId}`);
  },

  
  getMovementsByDateRange: async (startDate, endDate) => {
    return apiClient.request(`/stock-movements/date-range?start=${startDate}&end=${endDate}`);
  }
};