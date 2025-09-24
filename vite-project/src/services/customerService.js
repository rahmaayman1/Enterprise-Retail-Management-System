// services/customerService.js
import apiClient from './api';

export const customerService = {
  
  getAllCustomers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/customers${query ? `?${query}` : ''}`);
  },

  
  getCustomerById: async (id) => {
    return apiClient.request(`/customers/${id}`);
  },

  
  createCustomer: async (customerData) => {
    return apiClient.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  
  updateCustomer: async (id, customerData) => {
    return apiClient.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  },

  
  deleteCustomer: async (id) => {
    return apiClient.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  },

  
  searchCustomers: async (query) => {
    return apiClient.request(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  getCustomerPurchaseHistory: async (id) => {
    return apiClient.request(`/customers/${id}/purchases`);
  }
};
