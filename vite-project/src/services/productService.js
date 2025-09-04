// services/productService.js
import apiClient from './api';

export const productService = {
  getAllProducts: async () => {
    return apiClient.request('/products');
  },

  getProductById: async (id) => {
    return apiClient.request(`/products/${id}`);
  },

  createProduct: async (productData) => {
    return apiClient.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  updateProduct: async (id, productData) => {
    return apiClient.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return apiClient.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};