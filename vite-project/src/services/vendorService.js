// services/vendorService.js
import apiClient from './api';

export const vendorService = {
  
  getAllVendors: async () => {
    return apiClient.request('/vendors');
  },

  
  getVendorById: async (id) => {
    return apiClient.request(`/vendors/${id}`);
  },

  
  createVendor: async (vendorData) => {
    return apiClient.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData)
    });
  },

  
  updateVendor: async (id, vendorData) => {
    return apiClient.request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData)
    });
  },

  
  deleteVendor: async (id) => {
    return apiClient.request(`/vendors/${id}`, {
      method: 'DELETE'
    });
  },

  
  getActiveVendors: async () => {
    return apiClient.request('/vendors/active');
  },

  
  getVendorPurchaseHistory: async (id) => {
    return apiClient.request(`/vendors/${id}/purchases`);
  }
};