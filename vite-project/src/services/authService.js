// services/authService.js
import apiClient from './api';

export const authService = {
  
  login: async (email, password) => {
    return apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  
  register: async (userData) => {
    return apiClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};