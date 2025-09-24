// services/ledgerService.js
import apiClient from './api';

export const ledgerService = {
  
  getAllLedgers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return apiClient.request(`/ledgers${query ? `?${query}` : ''}`);
  },

 
  getLedgerById: async (id) => {
    return apiClient.request(`/ledgers/${id}`);
  },

  
  createLedger: async (ledgerData) => {
    return apiClient.request('/ledgers', {
      method: 'POST',
      body: JSON.stringify(ledgerData)
    });
  },

  
  updateLedger: async (id, ledgerData) => {
    return apiClient.request(`/ledgers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ledgerData)
    });
  },

  
  deleteLedger: async (id) => {
    return apiClient.request(`/ledgers/${id}`, {
      method: 'DELETE'
    });
  },

  
  getProfitAndLoss: async (startDate, endDate) => {
    return apiClient.request(`/ledgers/profit-loss?start=${startDate}&end=${endDate}`);
  },

  
  getBalanceSheet: async (date) => {
    return apiClient.request(`/ledgers/balance-sheet?date=${date}`);
  }
};
