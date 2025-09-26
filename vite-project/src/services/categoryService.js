// services/categoryService.js
import apiClient from './api';

export const categoryService = {
  
  getAllCategories: async () => {
    return apiClient.request('/categories');
  },

  
  getCategoryById: async (id) => {
    return apiClient.request(`/categories/${id}`);
  },

  
  createCategory: async (categoryData) => {
    return apiClient.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  
  updateCategory: async (id, categoryData) => {
    return apiClient.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

 
  deleteCategory: async (id) => {
    return apiClient.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  
  getActiveCategories: async () => {
    return apiClient.request('/categories');
  }
};