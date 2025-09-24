// services/dashboardService.js
import apiClient from './api';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiClient.request('/dashboard/stats');
  },

  // Get today's sales summary
  getTodaySales: async () => {
    return apiClient.request('/dashboard/today-sales');
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 10) => {
    return apiClient.request(`/dashboard/recent-transactions?limit=${limit}`);
  },

  // Get low stock products
  getLowStockProducts: async () => {
    return apiClient.request('/dashboard/low-stock');
  },

  // Get expired products
  getExpiredProducts: async () => {
    return apiClient.request('/dashboard/expired');
  },

  // Get monthly sales summary
  getMonthlySales: async (year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
    return apiClient.request(`/dashboard/monthly-sales?year=${year}&month=${month}`);
  }
};