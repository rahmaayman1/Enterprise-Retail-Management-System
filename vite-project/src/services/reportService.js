// services/reportService.js
import apiClient from './api';

export const reportsService = {
  
  getSalesReport: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/reports/sales${query ? `?${query}` : ''}`);
  },

  
  getPurchasesReport: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/reports/purchases${query ? `?${query}` : ''}`);
  },

  
  getInventoryReport: async () => {
    return apiClient.request('/reports/inventory');
  },

  
  getCustomersReport: async () => {
    return apiClient.request('/reports/customers');
  },

  
  getBestSellingProducts: async (period = 'month') => {
    return apiClient.request(`/reports/best-selling?period=${period}`);
  },

  
  getProfitReport: async (startDate, endDate) => {
    return apiClient.request(`/reports/profit?start=${startDate}&end=${endDate}`);
  },

  
  getCashFlowReport: async (period = 'month') => {
    return apiClient.request(`/reports/cash-flow?period=${period}`);
  },

  
  downloadReport: async (reportType, filters = {}) => {
  const API_BASE_URL = 'http://localhost:5000/api'; 
  
  const query = new URLSearchParams({ ...filters, format: 'pdf' }).toString();
  const response = await fetch(`${API_BASE_URL}/reports/${reportType}?${query}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to download report');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}-report.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
};