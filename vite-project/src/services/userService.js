// services/userService.js
import apiClient from './api';

export const userService = {
  // جلب كل المستخدمين
  getAllUsers: async () => {
    return apiClient.request('/users');
  },

  // جلب مستخدم بالـ ID
  getUserById: async (id) => {
    return apiClient.request(`/users/${id}`);
  },

  // إنشاء مستخدم جديد
  createUser: async (userData) => {
    return apiClient.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // تحديث مستخدم
  updateUser: async (id, userData) => {
    return apiClient.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // حذف مستخدم
  deleteUser: async (id) => {
    return apiClient.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};