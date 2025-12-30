/**
 * 💰 TRANSACTIONS API ENDPOINT
 * 
 * Handles transaction/sales-related requests
 * GET /api/transactions - Get all transactions
 * POST /api/transactions - Create new transaction
 */

import { NextResponse } from 'next/server';
import { transactions } from '../data/transactions';

// GET all transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredTransactions = transactions;

    // Filter by date range if provided
    if (startDate && endDate) {
      filteredTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
      });
    }

    return NextResponse.json({
      success: true,
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Create new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, items, total } = body;

    // Validate input
    if (!customerName || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate receipt number and transaction data
    const now = new Date();
    const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;
    
    const newTransaction = {
      id: receiptNumber,
      receiptNumber,
      customerName: customerName.trim(),
      items,
      total: parseFloat(total),
      timestamp: now.getTime(),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      kitchenStatus: 'preparing' as const, // New orders start as 'preparing'
    };

    // Add to our "database"
    transactions.unshift(newTransaction); // Add to beginning

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

