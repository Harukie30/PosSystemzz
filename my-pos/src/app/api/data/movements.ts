/**
 * 📊 SHARED PRODUCT MOVEMENTS DATA STORE
 * 
 * This file contains the shared in-memory product movements data.
 * 
 * TODO: Replace with database in production
 */

export interface ProductMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: string;
  timestamp: string;
}

// Shared movements array
export let movements: ProductMovement[] = [];

