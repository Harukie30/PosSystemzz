/**
 * 📦 PRODUCTS API ENDPOINT
 * 
 * Handles product-related requests
 * GET /api/products - Get all products
 * POST /api/products - Create new product
 * 
 * TODO: Replace in-memory storage with database
 */

import { NextResponse } from 'next/server';
import { products, type Product } from '../data/products';

// GET all products
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock, category, image, sku } = body;

    // Validate input
    if (!name || !price || !stock || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map((p: Product) => p.id)) + 1 : 1,
      name,
      sku: sku || `PRD-${String(products.length + 1).padStart(3, '0')}`,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      image: image || '',
    };

    // Add to our "database"
    products.push(newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

