// services/ledgerService.js
import apiClient from './api';

export const ledgerService = {
  // جلب كل القيود المحاسبية
  getAllLedgers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/ledgers${query ? `?${query}` : ''}`);
  },

  // جلب قيد بالـ ID
  getLedgerById: async (id) => {
    return apiClient.request(`/ledgers/${id}`);
  },

  // إنشاء قيد جديد
  createLedger: async (ledgerData) => {
    return apiClient.request('/ledgers', {
      method: 'POST',
      body: JSON.stringify(ledgerData)
    });
  },

  // تحديث قيد
  updateLedger: async (id, ledgerData) => {
    return apiClient.request(`/ledgers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ledgerData)
    });
  },

  // حذف قيد
  deleteLedger: async (id) => {
    return apiClient.request(`/ledgers/${id}`, {
      method: 'DELETE'
    });
  },

  // جلب الأرباح والخسائر
  getProfitAndLoss: async (startDate, endDate) => {
    return apiClient.request(`/ledgers/profit-loss?start=${startDate}&end=${endDate}`);
  },

  // جلب الميزانية العمومية
  getBalanceSheet: async (date) => {
    return apiClient.request(`/ledgers/balance-sheet?date=${date}`);
  }
};
