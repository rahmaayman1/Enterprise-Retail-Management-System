// services/customerService.js
import apiClient from './api';

export const customerService = {
  // جلب كل العملاء
  getAllCustomers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/customers${query ? `?${query}` : ''}`);
  },

  // جلب عميل بالـ ID
  getCustomerById: async (id) => {
    return apiClient.request(`/customers/${id}`);
  },

  // إنشاء عميل جديد
  createCustomer: async (customerData) => {
    return apiClient.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  // تحديث عميل
  updateCustomer: async (id, customerData) => {
    return apiClient.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  },

  // حذف عميل
  deleteCustomer: async (id) => {
    return apiClient.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  },

  // البحث في العملاء
  searchCustomers: async (query) => {
    return apiClient.request(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  // جلب تاريخ مشتريات العميل
  getCustomerPurchaseHistory: async (id) => {
    return apiClient.request(`/customers/${id}/purchases`);
  }
};
