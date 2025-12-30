/**
 * 🔧 AXIOS CLIENT CONFIGURATION
 * 
 * This file sets up Axios with default configuration and interceptors.
 * All API calls will use this configured instance.
 */

import axios from 'axios';

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: '/api', // All API calls will start with /api
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - runs before every request
axiosClient.interceptors.request.use(
  (config) => {
    // Add auth token if user is logged in
    // TODO: Uncomment when authentication is implemented
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response Interceptor - runs after every response
axiosClient.interceptors.response.use(
  (response) => {
    // If successful, return the data directly
    // This way you don't need to do response.data in every call
    return response.data;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const message = error.response.data?.error || 
                     error.response.data?.message || 
                     'Something went wrong';
      
      // You can add specific error handling here
      // For example, redirect to login on 401
      // if (error.response.status === 401) {
      //   window.location.href = '/login';
      // }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response received (network error)
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export default axiosClient;

