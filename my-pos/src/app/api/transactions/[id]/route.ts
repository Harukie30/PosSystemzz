/**
 * 💰 TRANSACTION BY ID API ENDPOINT
 * 
 * Handles single transaction operations
 * GET /api/transactions/[id] - Get transaction by ID
 * PUT /api/transactions/[id] - Update transaction (e.g., kitchen status)
 * DELETE /api/transactions/[id] - Void/Delete transaction
 */

import { NextResponse } from 'next/server';
import { transactions, type Transaction } from '../../data/transactions';

// GET transaction by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = transactions.find((t: Transaction) => t.id === id || t.receiptNumber === id);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT - Update transaction (e.g., kitchen status)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kitchenStatus } = body;

    const index = transactions.findIndex((t: Transaction) => t.id === id || t.receiptNumber === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update kitchen status if provided
    if (kitchenStatus && (kitchenStatus === 'preparing' || kitchenStatus === 'completed')) {
      transactions[index] = {
        ...transactions[index],
        kitchenStatus,
      };
    }

    return NextResponse.json({
      success: true,
      transaction: transactions[index],
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE - Void transaction
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = transactions.findIndex((t: Transaction) => t.id === id || t.receiptNumber === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    transactions.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Transaction voided successfully',
    });
  } catch (error) {
    console.error('Void transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to void transaction' },
      { status: 500 }
    );
  }
}

