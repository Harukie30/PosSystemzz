/**
 * 💰 SHARED TRANSACTIONS DATA STORE
 * 
 * This file contains the shared in-memory transactions data.
 * All API routes import from here to ensure data consistency.
 * 
 * TODO: Replace with database in production
 */

export interface Transaction {
  id: string;
  receiptNumber: string;
  customerName: string;
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
  total: number;
  timestamp: number;
  time: string;
  date: string;
  userId?: number;
  kitchenStatus?: 'preparing' | 'completed'; // Kitchen order status
}

// Shared transactions array - all API routes use this
export let transactions: Transaction[] = [];

