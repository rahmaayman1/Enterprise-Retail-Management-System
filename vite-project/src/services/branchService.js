// services/branchService.js
import apiClient from './api';

export const branchService = {
  
  getAllBranches: async () => {
    return apiClient.request('/branches');
  },

  
  getBranchById: async (id) => {
    return apiClient.request(`/branches/${id}`);
  },

  
  createBranch: async (branchData) => {
    return apiClient.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData)
    });
  },

  
  updateBranch: async (id, branchData) => {
    return apiClient.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData)
    });
  },

  
  deleteBranch: async (id) => {
    return apiClient.request(`/branches/${id}`, {
      method: 'DELETE'
    });
  },

  
  getActiveBranches: async () => {
    return apiClient.request('/branches/active');
  },

  
  getBranchStats: async (id) => {
    return apiClient.request(`/branches/${id}/stats`);
  }
};