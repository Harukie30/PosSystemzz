/**
 * 📊 DASHBOARD API ENDPOINT
 * 
 * Handles dashboard statistics and data
 * GET /api/dashboard - Get dashboard stats and recent transactions
 */

import { NextResponse } from 'next/server';

// Mock dashboard data - in production, calculate from database
const getDashboardStats = () => {
  return {
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
};

const getRecentTransactions = () => {
  // Mock recent transactions - in production, fetch from database
  return [
    {
      id: '1',
      receiptNumber: 'REC-00000001',
      customerName: 'Customer A',
      items: [{ id: 1, name: 'Product A', price: 22.75, quantity: 2 }],
      total: 45.5,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    {
      id: '2',
      receiptNumber: 'REC-00000002',
      customerName: 'Customer B',
      items: [{ id: 2, name: 'Product B', price: 25.0, quantity: 1 }],
      total: 25.0,
      timestamp: Date.now() - 1000 * 60 * 15,
      time: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    {
      id: '3',
      receiptNumber: 'REC-00000003',
      customerName: 'Customer C',
      items: [{ id: 3, name: 'Product C', price: 22.5, quantity: 3 }],
      total: 67.5,
      timestamp: Date.now() - 1000 * 60 * 45,
      time: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
  ];
};

export async function GET() {
  try {
    const stats = getDashboardStats();
    const recentTransactions = getRecentTransactions();

    return NextResponse.json({
      success: true,
      stats,
      recentTransactions,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

