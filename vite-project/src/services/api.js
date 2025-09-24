// services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; 


const apiClient = {

  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
  method: options.method || 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  },
  ...options
};
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};

export default apiClient;