/**
 * 📦 SHARED PRODUCTS DATA STORE
 * 
 * This file contains the shared in-memory products data.
 * All API routes import from here to ensure data consistency.
 * 
 * TODO: Replace with database in production
 */

export interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
  image: string;
}

// Shared products array - all API routes use this
export let products: Product[] = [
  { id: 1, name: 'Product A', sku: 'PRD-001', stock: 45, price: 22.75, category: 'Electronics', image: '' },
  { id: 2, name: 'Product B', sku: 'PRD-002', stock: 32, price: 25.0, category: 'Electronics', image: '' },
  { id: 3, name: 'Product C', sku: 'PRD-003', stock: 18, price: 22.5, category: 'Clothing', image: '' },
  { id: 4, name: 'Product D', sku: 'PRD-004', stock: 67, price: 45.0, category: 'Home', image: '' },
  { id: 5, name: 'Product E', sku: 'PRD-005', stock: 12, price: 15.25, category: 'Clothing', image: '' },
  { id: 6, name: 'Product F', sku: 'PRD-006', stock: 89, price: 30.0, category: 'Electronics', image: '' },
  { id: 7, name: 'Product G', sku: 'PRD-007', stock: 24, price: 25.0, category: 'Home', image: '' },
  { id: 8, name: 'Product H', sku: 'PRD-008', stock: 56, price: 40.0, category: 'Electronics', image: '' },
];

