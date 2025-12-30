/**
 * 📊 REPORTS API SERVICE
 * 
 * Handles all reports-related API calls
 * Calculates statistics from transactions and products
 */

import axiosClient from './axiosClient';
import type { Transaction, Product } from './types';

export interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
  percentage: number;
}

export interface SalesReport {
  totalSales: number;
  totalTransactions: number;
  topProducts: TopProduct[];
}

export interface InventoryAlert {
  name: string;
  currentStock: number;
  minThreshold: number;
  category: string;
}

export interface FastMovingProduct {
  name: string;
  salesCount: number;
  category: string;
}

export interface ReportsResponse {
  success: boolean;
  salesReport?: SalesReport;
  inventoryAlerts?: {
    lowStock: InventoryAlert[];
    outOfStock: InventoryAlert[];
    fastMoving: FastMovingProduct[];
  };
  error?: string;
}

// Toggle this to switch between mock and real API
const USE_MOCK = false; // Backend is ready!

export const reportsApi = {
  /**
   * Get sales report for a specific period
   */
  getSalesReport: async (period: 'day' | 'week' | 'month' | 'year'): Promise<SalesReport> => {
    if (USE_MOCK) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        totalSales: 0,
        totalTransactions: 0,
        topProducts: [],
      };
    }

    // Real API call - calculate from transactions
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    const endDate = new Date(now);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Fetch transactions for the period
    const transactionsResponse = await axiosClient.get(`/transactions?startDate=${startDateStr}&endDate=${endDateStr}`) as { success: boolean; transactions: Transaction[] };
    
    if (!transactionsResponse.success || !transactionsResponse.transactions) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        topProducts: [],
      };
    }

    const transactions = transactionsResponse.transactions;
    
    // Calculate totals
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    // Calculate top products
    const productSales = new Map<string, { sales: number; quantity: number }>();
    
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existing = productSales.get(item.name) || { sales: 0, quantity: 0 };
        productSales.set(item.name, {
          sales: existing.sales + (item.price * item.quantity),
          quantity: existing.quantity + item.quantity,
        });
      });
    });
    
    // Convert to array and sort by sales
    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        quantity: data.quantity,
        percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5
    
    return {
      totalSales,
      totalTransactions,
      topProducts,
    };
  },

  /**
   * Get inventory alerts (low stock, out of stock, fast moving)
   */
  getInventoryAlerts: async (): Promise<{
    lowStock: InventoryAlert[];
    outOfStock: InventoryAlert[];
    fastMoving: FastMovingProduct[];
  }> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        lowStock: [],
        outOfStock: [],
        fastMoving: [],
      };
    }

    // Fetch products
    const productsResponse = await axiosClient.get('/products') as { success: boolean; products: Product[] };
    
    if (!productsResponse.success || !productsResponse.products) {
      return {
        lowStock: [],
        outOfStock: [],
        fastMoving: [],
      };
    }

    const products = productsResponse.products;
    
    // Fetch all transactions to calculate fast moving
    const transactionsResponse = await axiosClient.get('/transactions') as { success: boolean; transactions: Transaction[] };
    const transactions = transactionsResponse.success && transactionsResponse.transactions ? transactionsResponse.transactions : [];
    
    // Calculate low stock (stock < 20 or custom threshold)
    const lowStock: InventoryAlert[] = products
      .filter((p) => p.stock < 20 && p.stock > 0)
      .map((p) => ({
        name: p.name,
        currentStock: p.stock,
        minThreshold: 20,
        category: p.category,
      }));
    
    // Calculate out of stock
    const outOfStock: InventoryAlert[] = products
      .filter((p) => p.stock === 0)
      .map((p) => ({
        name: p.name,
        currentStock: 0,
        minThreshold: 20,
        category: p.category,
      }));
    
    // Calculate fast moving products (from transactions)
    const productCounts = new Map<string, { count: number; category: string }>();
    
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existing = productCounts.get(item.name) || { count: 0, category: '' };
        const product = products.find((p) => p.name === item.name);
        productCounts.set(item.name, {
          count: existing.count + item.quantity,
          category: product?.category || 'Unknown',
        });
      });
    });
    
    const fastMoving: FastMovingProduct[] = Array.from(productCounts.entries())
      .map(([name, data]) => ({
        name,
        salesCount: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5); // Top 5
    
    return {
      lowStock,
      outOfStock,
      fastMoving,
    };
  },
};

