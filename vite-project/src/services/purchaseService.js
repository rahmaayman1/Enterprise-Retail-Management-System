// services/purchaseService.js
import apiClient from './api';

export const purchaseService = {
  // جلب كل المشتريات
  getAllPurchases: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/purchases${query ? `?${query}` : ''}`);
  },

  // جلب مشترى بالـ ID
  getPurchaseById: async (id) => {
    return apiClient.request(`/purchases/${id}`);
  },

  // إنشاء مشترى جديد
  createPurchase: async (purchaseData) => {
    return apiClient.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  },

  // تحديث مشترى
  updatePurchase: async (id, purchaseData) => {
    return apiClient.request(`/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(purchaseData)
    });
  },

  // حذف مشترى
  deletePurchase: async (id) => {
    return apiClient.request(`/purchases/${id}`, {
      method: 'DELETE'
    });
  },

  // تأكيد استلام المشترى
  confirmReceived: async (id) => {
    return apiClient.request(`/purchases/${id}/confirm`, {
      method: 'POST'
    });
  },

  // إلغاء مشترى
  cancelPurchase: async (id, reason) => {
    return apiClient.request(`/purchases/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};