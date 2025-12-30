/**
 * 📊 PRODUCT MOVEMENTS API ENDPOINT
 * 
 * Handles product movement tracking
 * GET /api/products/movements - Get all product movements
 */

import { NextResponse } from 'next/server';
import { movements } from '../../data/movements';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      movements: movements,
    });
  } catch (error) {
    console.error('Get movements error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movements' },
      { status: 500 }
    );
  }
}

