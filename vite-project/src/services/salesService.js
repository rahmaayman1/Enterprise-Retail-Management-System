// services/salesService.js
import apiClient from './api';

export const salesService = {
  // جلب كل المبيعات
  getAllSales: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/sales${query ? `?${query}` : ''}`);
  },

  // جلب مبيعة بالـ ID
  getSaleById: async (id) => {
    return apiClient.request(`/sales/${id}`);
  },

  // إنشاء مبيعة جديدة
  createSale: async (saleData) => {
    return apiClient.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData)
    });
  },

  // تحديث مبيعة
  updateSale: async (id, saleData) => {
    return apiClient.request(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData)
    });
  },

  // حذف مبيعة
  deleteSale: async (id) => {
    return apiClient.request(`/sales/${id}`, {
      method: 'DELETE'
    });
  },

  // جلب مبيعات اليوم
  getTodaySales: async () => {
    return apiClient.request('/sales/today');
  },

  // جلب مبيعات فترة معينة
  getSalesByDateRange: async (startDate, endDate) => {
    return apiClient.request(`/sales/date-range?start=${startDate}&end=${endDate}`);
  },

  // جلب إحصائيات المبيعات
  getSalesStats: async (period = 'month') => {
    return apiClient.request(`/sales/stats?period=${period}`);
  },

  // إلغاء مبيعة
  cancelSale: async (id, reason) => {
    return apiClient.request(`/sales/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};