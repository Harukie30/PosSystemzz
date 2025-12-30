/**
 * 🔐 LOGIN API ENDPOINT
 * 
 * Handles user login requests
 * POST /api/auth/login
 * 
 * Request body: { username, password, role }
 * Response: { success, user, error, message }
 */

import { NextResponse } from 'next/server';

// Temporary user storage - will be replaced with database later
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: 2, username: 'cashier', password: 'cashier123', role: 'cashier' as const },
  { id: 3, username: 'kitchen', password: 'kitchen123', role: 'kitchen' as const },
];

export async function POST(request: Request) {
  try {
    // Get the data sent from frontend
    const body = await request.json();
    const { username, password, role } = body;

    // Validate input
    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    // Find user in our "database"
    const user = USERS.find(
      (u) => u.username === username && u.password === password && u.role === role
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Success! Return user data (without password for security)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      message: 'Login successful!',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

