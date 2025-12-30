/**
 * 🔐 AUTH API SERVICE
 * 
 * Handles all authentication-related API calls
 * Currently uses mock data - will switch to real API when backend is ready
 */

import axiosClient from './axiosClient';
import type { LoginRequest, LoginResponse, UserRole } from './types';

// Mock users for development
const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' as UserRole },
  { id: 2, username: 'cashier', password: 'cashier123', role: 'cashier' as UserRole },
  { id: 3, username: 'kitchen', password: 'kitchen123', role: 'kitchen' as UserRole },
];

// Toggle this to switch between mock and real API
const USE_MOCK = false; // Backend is ready!

export const authApi = {
  /**
   * Login user
   * @param username - User's username
   * @param password - User's password
   * @param role - User's role (admin, cashier, kitchen)
   */
  login: async (username: string, password: string, role: UserRole): Promise<LoginResponse> => {
    if (USE_MOCK) {
      // Mock implementation - simulates API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(
        (u) => u.username === username && u.password === password && u.role === role
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        message: 'Login successful!',
      };
    }

    // Real API call
    return axiosClient.post('/auth/login', {
      username,
      password,
      role,
    }) as Promise<LoginResponse>;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    return axiosClient.post('/auth/logout');
  },

  /**
   * Verify current user session
   */
  verify: async (): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    return axiosClient.get('/auth/verify') as Promise<LoginResponse>;
  },
};

