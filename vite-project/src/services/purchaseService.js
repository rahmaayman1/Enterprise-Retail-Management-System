// services/purchaseService.js
import apiClient from './api';

export const purchaseService = {
  
  getAllPurchases: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/purchases${query ? `?${query}` : ''}`);
  },

  
  getPurchaseById: async (id) => {
    return apiClient.request(`/purchases/${id}`);
  },

  
  createPurchase: async (purchaseData) => {
    return apiClient.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  },

  
  updatePurchase: async (id, purchaseData) => {
    return apiClient.request(`/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(purchaseData)
    });
  },

  
  deletePurchase: async (id) => {
    return apiClient.request(`/purchases/${id}`, {
      method: 'DELETE'
    });
  },

  
  confirmReceived: async (id) => {
    return apiClient.request(`/purchases/${id}/confirm`, {
      method: 'POST'
    });
  },

  
  cancelPurchase: async (id, reason) => {
    return apiClient.request(`/purchases/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};