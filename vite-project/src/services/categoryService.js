// services/categoryService.js
import apiClient from './api';

export const categoryService = {
  // جلب كل الفئات
  getAllCategories: async () => {
    return apiClient.request('/categories');
  },

  // جلب فئة بالـ ID
  getCategoryById: async (id) => {
    return apiClient.request(`/categories/${id}`);
  },

  // إنشاء فئة جديدة
  createCategory: async (categoryData) => {
    return apiClient.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  // تحديث فئة
  updateCategory: async (id, categoryData) => {
    return apiClient.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  // حذف فئة
  deleteCategory: async (id) => {
    return apiClient.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // جلب الفئات النشطة فقط
  getActiveCategories: async () => {
    return apiClient.request('/categories/active');
  }
};