//backupService
import apiClient from './api';

export const backupService = {
  
  createBackup: async () => {
    return apiClient.request('/backup/create', {
      method: 'POST'
    });
  },

  
  getAllBackups: async () => {
    return apiClient.request('/backup');
  },

  
  restoreBackup: async (backupId) => {
    return apiClient.request(`/backup/restore/${backupId}`, {
      method: 'POST'
    });
  },

  
  deleteBackup: async (backupId) => {
    return apiClient.request(`/backup/${backupId}`, {
      method: 'DELETE'
    });
  },

  
  downloadBackup: async (backupId) => {
    const response = await fetch(`${API_BASE_URL}/backup/download/${backupId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to download backup');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${backupId}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};