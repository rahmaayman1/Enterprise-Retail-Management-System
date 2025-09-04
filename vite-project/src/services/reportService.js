// services/reportsService.js
import apiClient from './api';

export const reportsService = {
  // تقرير المبيعات
  getSalesReport: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/reports/sales${query ? `?${query}` : ''}`);
  },

  // تقرير المشتريات
  getPurchasesReport: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/reports/purchases${query ? `?${query}` : ''}`);
  },

  // تقرير المخزون
  getInventoryReport: async () => {
    return apiClient.request('/reports/inventory');
  },

  // تقرير العملاء
  getCustomersReport: async () => {
    return apiClient.request('/reports/customers');
  },

  // تقرير المنتجات الأكثر مبيعاً
  getBestSellingProducts: async (period = 'month') => {
    return apiClient.request(`/reports/best-selling?period=${period}`);
  },

  // تقرير الأرباح
  getProfitReport: async (startDate, endDate) => {
    return apiClient.request(`/reports/profit?start=${startDate}&end=${endDate}`);
  },

  // تقرير التدفق النقدي
  getCashFlowReport: async (period = 'month') => {
    return apiClient.request(`/reports/cash-flow?period=${period}`);
  },

  // تحميل تقرير PDF
  downloadReport: async (reportType, filters = {}) => {
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