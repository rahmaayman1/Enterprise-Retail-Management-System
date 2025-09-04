// services/branchService.js
import apiClient from './api';

export const branchService = {
  // جلب كل الفروع
  getAllBranches: async () => {
    return apiClient.request('/branches');
  },

  // جلب فرع بالـ ID
  getBranchById: async (id) => {
    return apiClient.request(`/branches/${id}`);
  },

  // إنشاء فرع جديد
  createBranch: async (branchData) => {
    return apiClient.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData)
    });
  },

  // تحديث فرع
  updateBranch: async (id, branchData) => {
    return apiClient.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData)
    });
  },

  // حذف فرع
  deleteBranch: async (id) => {
    return apiClient.request(`/branches/${id}`, {
      method: 'DELETE'
    });
  },

  // جلب الفروع النشطة
  getActiveBranches: async () => {
    return apiClient.request('/branches/active');
  },

  // جلب إحصائيات الفرع
  getBranchStats: async (id) => {
    return apiClient.request(`/branches/${id}/stats`);
  }
};