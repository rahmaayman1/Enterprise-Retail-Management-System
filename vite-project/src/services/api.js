// services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // غير الـ port حسب الـ backend بتاعك

// تكوين Axios أو Fetch
const apiClient = {
  // دالة عامة للطلبات
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};

export default apiClient;