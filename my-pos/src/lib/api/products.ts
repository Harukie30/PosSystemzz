/**
 * 📦 PRODUCTS API SERVICE
 * 
 * Handles all product-related API calls
 * Currently uses mock data - will switch to real API when backend is ready
 */

import axiosClient from './axiosClient';
import type {
  Product,
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductMovementsResponse,
} from './types';

// Mock products data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Product A', sku: 'PRD-001', stock: 45, price: 22.75, category: 'Electronics', image: '' },
  { id: 2, name: 'Product B', sku: 'PRD-002', stock: 32, price: 25.0, category: 'Electronics', image: '' },
  { id: 3, name: 'Product C', sku: 'PRD-003', stock: 18, price: 22.5, category: 'Clothing', image: '' },
  { id: 4, name: 'Product D', sku: 'PRD-004', stock: 67, price: 45.0, category: 'Home', image: '' },
  { id: 5, name: 'Product E', sku: 'PRD-005', stock: 12, price: 15.25, category: 'Clothing', image: '' },
  { id: 6, name: 'Product F', sku: 'PRD-006', stock: 89, price: 30.0, category: 'Electronics', image: '' },
  { id: 7, name: 'Product G', sku: 'PRD-007', stock: 24, price: 25.0, category: 'Home', image: '' },
  { id: 8, name: 'Product H', sku: 'PRD-008', stock: 56, price: 40.0, category: 'Electronics', image: '' },
];

// Mock product movements
const MOCK_MOVEMENTS = [
  { id: 1, date: '2024-01-15', time: '10:30 AM', product: 'Product A', productId: 1, type: 'in' as const, quantity: 10, reason: 'Restock' },
  { id: 2, date: '2024-01-15', time: '10:15 AM', product: 'Product B', productId: 2, type: 'out' as const, quantity: 2, reason: 'Sale' },
  { id: 3, date: '2024-01-15', time: '09:45 AM', product: 'Product C', productId: 3, type: 'out' as const, quantity: 3, reason: 'Sale' },
  { id: 4, date: '2024-01-14', time: '04:20 PM', product: 'Product D', productId: 4, type: 'in' as const, quantity: 20, reason: 'Restock' },
];

// Toggle this to switch between mock and real API
const USE_MOCK = false; // Backend is ready!

// In-memory storage for mock (simulates database)
let mockProductsStore = [...MOCK_PRODUCTS];

export const productsApi = {
  /**
   * Get all products
   */
  getAll: async (): Promise<ProductsResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        products: mockProductsStore,
      };
    }

    return axiosClient.get<ProductsResponse>('/products');
  },

  /**
   * Get single product by ID
   */
  getById: async (id: number): Promise<ProductResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const product = mockProductsStore.find((p) => p.id === id);
      
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        } as ProductResponse;
      }

      return {
        success: true,
        product,
      };
    }

    return axiosClient.get<ProductResponse>(`/products/${id}`);
  },

  /**
   * Create new product
   */
  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newProduct: Product = {
        id: mockProductsStore.length > 0 ? Math.max(...mockProductsStore.map((p) => p.id)) + 1 : 1,
        name: data.name,
        sku: data.sku || `PRD-${String(mockProductsStore.length + 1).padStart(3, '0')}`,
        price: data.price,
        stock: data.stock,
        category: data.category,
        image: data.image || '',
      };

      mockProductsStore.push(newProduct);

      return {
        success: true,
        product: newProduct,
        message: 'Product created successfully',
      };
    }

    return axiosClient.post<ProductResponse>('/products', data);
  },

  /**
   * Update existing product
   */
  update: async (data: UpdateProductRequest): Promise<ProductResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const index = mockProductsStore.findIndex((p) => p.id === data.id);
      if (index === -1) {
        return {
          success: false,
          error: 'Product not found',
        } as ProductResponse;
      }

      mockProductsStore[index] = {
        ...mockProductsStore[index],
        ...data,
      };

      return {
        success: true,
        product: mockProductsStore[index],
        message: 'Product updated successfully',
      };
    }

    return axiosClient.put<ProductResponse>(`/products/${data.id}`, data);
  },

  /**
   * Delete product
   */
  delete: async (id: number): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const index = mockProductsStore.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      mockProductsStore.splice(index, 1);

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    }

    return axiosClient.delete(`/products/${id}`);
  },

  /**
   * Get product movements
   */
  getMovements: async (): Promise<ProductMovementsResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        success: true,
        movements: MOCK_MOVEMENTS,
      };
    }

    return axiosClient.get<ProductMovementsResponse>('/products/movements');
  },
};

