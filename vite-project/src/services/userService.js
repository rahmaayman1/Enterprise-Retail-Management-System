// services/userService.js
import apiClient from './api';

export const userService = {
  
  getAllUsers: async () => {
    return apiClient.request('/users');
  },

  
  getUserById: async (id) => {
    return apiClient.request(`/users/${id}`);
  },

  
  createUser: async (userData) => {
    return apiClient.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  
  updateUser: async (id, userData) => {
    return apiClient.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  
  deleteUser: async (id) => {
    return apiClient.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};