/**
 * 📊 DASHBOARD API SERVICE
 * 
 * Handles all dashboard-related API calls
 * Currently uses mock data - will switch to real API when backend is ready
 */

import axiosClient from './axiosClient';
import type { DashboardResponse, DashboardStats, Transaction } from './types';

// Mock dashboard data
const MOCK_DASHBOARD_STATS: DashboardStats = {
  today: { amount: 1250.5, transactions: 23, change: +12.5 },
  week: { amount: 8750.75, transactions: 156, change: +8.3 },
  month: { amount: 34200.0, transactions: 589, change: +15.2 },
  year: { amount: 425000.0, transactions: 7250, change: +22.1 },
  productMovements: {
    in: 45,
    out: 32,
    net: +13,
  },
};

const MOCK_RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    receiptNumber: 'REC-00000001',
    customerName: 'Customer A',
    items: [{ id: 1, name: 'Product A', price: 22.75, quantity: 2 }],
    total: 45.5,
    timestamp: Date.now(),
    time: '10:30 AM',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    id: '2',
    receiptNumber: 'REC-00000002',
    customerName: 'Customer B',
    items: [{ id: 2, name: 'Product B', price: 25.0, quantity: 1 }],
    total: 25.0,
    timestamp: Date.now() - 1000 * 60 * 15,
    time: '10:15 AM',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    id: '3',
    receiptNumber: 'REC-00000003',
    customerName: 'Customer C',
    items: [{ id: 3, name: 'Product C', price: 22.5, quantity: 3 }],
    total: 67.5,
    timestamp: Date.now() - 1000 * 60 * 45,
    time: '09:45 AM',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
];

// Toggle this to switch between mock and real API
const USE_MOCK = false; // Backend is ready!

export const dashboardApi = {
  /**
   * Get dashboard statistics and recent transactions
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        success: true,
        stats: MOCK_DASHBOARD_STATS,
        recentTransactions: MOCK_RECENT_TRANSACTIONS,
      };
    }

    return axiosClient.get('/dashboard') as Promise<DashboardResponse>;
  },
};

