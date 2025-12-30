/**
 * 💰 TRANSACTIONS API SERVICE
 * 
 * Handles all transaction/sales-related API calls
 * Currently uses mock data - will switch to real API when backend is ready
 */

import axiosClient from './axiosClient';
import type {
  Transaction,
  TransactionsResponse,
  TransactionResponse,
  CreateTransactionRequest,
} from './types';

// Mock transactions data
const MOCK_TRANSACTIONS: Transaction[] = [];

// Toggle this to switch between mock and real API
const USE_MOCK = false; // Backend is ready!

// In-memory storage for mock (simulates database)
let mockTransactionsStore = [...MOCK_TRANSACTIONS];

export const transactionsApi = {
  /**
   * Get all transactions
   */
  getAll: async (): Promise<TransactionsResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        transactions: mockTransactionsStore,
      };
    }

    return axiosClient.get('/transactions') as Promise<TransactionsResponse>;
  },

  /**
   * Get transactions by date range
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<TransactionsResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const filtered = mockTransactionsStore.filter((t) => {
        const date = new Date(t.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
      return {
        success: true,
        transactions: filtered,
      };
    }

    return axiosClient.get(`/transactions?startDate=${startDate}&endDate=${endDate}`) as Promise<TransactionsResponse>;
  },

  /**
   * Get single transaction by ID
   */
  getById: async (id: string): Promise<TransactionResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const transaction = mockTransactionsStore.find((t) => t.id === id);
      
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        } as TransactionResponse;
      }

      return {
        success: true,
        transaction,
      };
    }

    return axiosClient.get(`/transactions/${id}`) as Promise<TransactionResponse>;
  },

  /**
   * Create new transaction
   */
  create: async (data: CreateTransactionRequest): Promise<TransactionResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const now = new Date();
      const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;
      
      const newTransaction: Transaction = {
        id: receiptNumber,
        receiptNumber,
        customerName: data.customerName,
        items: data.items,
        total: data.total,
        timestamp: now.getTime(),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      };

      mockTransactionsStore.unshift(newTransaction); // Add to beginning

      return {
        success: true,
        transaction: newTransaction,
        message: 'Transaction created successfully',
      };
    }

    return axiosClient.post('/transactions', data) as Promise<TransactionResponse>;
  },

  /**
   * Update kitchen status of a transaction
   */
  updateKitchenStatus: async (transactionId: string, status: 'preparing' | 'completed'): Promise<TransactionResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: false,
        error: 'Not implemented in mock',
      } as TransactionResponse;
    }

    return axiosClient.put(`/transactions/${transactionId}`, {
      kitchenStatus: status,
    }) as Promise<TransactionResponse>;
  },

  /**
   * Delete/Void transaction
   */
  void: async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const index = mockTransactionsStore.findIndex((t) => t.id === id);
      if (index === -1) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      mockTransactionsStore.splice(index, 1);

      return {
        success: true,
        message: 'Transaction voided successfully',
      };
    }

    return axiosClient.delete(`/transactions/${id}`);
  },
};

