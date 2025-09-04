// services/authService.js
import apiClient from './api';

export const authService = {
  // تسجيل الدخول
  login: async (email, password) => {
    return apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    return apiClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};