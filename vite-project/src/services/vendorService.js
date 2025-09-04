// services/vendorService.js
import apiClient from './api';

export const vendorService = {
  // جلب كل الموردين
  getAllVendors: async () => {
    return apiClient.request('/vendors');
  },

  // جلب مورد بالـ ID
  getVendorById: async (id) => {
    return apiClient.request(`/vendors/${id}`);
  },

  // إنشاء مورد جديد
  createVendor: async (vendorData) => {
    return apiClient.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData)
    });
  },

  // تحديث مورد
  updateVendor: async (id, vendorData) => {
    return apiClient.request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData)
    });
  },

  // حذف مورد
  deleteVendor: async (id) => {
    return apiClient.request(`/vendors/${id}`, {
      method: 'DELETE'
    });
  },

  // جلب الموردين النشطين
  getActiveVendors: async () => {
    return apiClient.request('/vendors/active');
  },

  // جلب تاريخ المشتريات من المورد
  getVendorPurchaseHistory: async (id) => {
    return apiClient.request(`/vendors/${id}/purchases`);
  }
};