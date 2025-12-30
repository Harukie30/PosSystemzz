# 🎯 HOC (Higher Order Component) Usage Guide

## What are HOCs?

HOCs are a React pattern that lets you wrap components with additional functionality. Think of them as "wrappers" that add features to your components.

## Available HOCs

### 1. `withAuth` - Authentication Protection
Protects routes that require login. Redirects to login if user is not authenticated.

**Usage:**
```typescript
import { withAuth } from '@/components/hoc';

function MyPage() {
  return <div>Protected Content</div>;
}

export default withAuth(MyPage);
```

### 2. `withRole` - Role-Based Protection
Protects routes based on user role. Only allows specific roles to access.

**Usage:**
```typescript
import { withRole } from '@/components/hoc';

function AdminPage() {
  return <div>Admin Only</div>;
}

// Only admin can access
export default withRole(AdminPage, ['admin']);

// Admin or cashier can access
export default withRole(CashierPage, ['admin', 'cashier']);
```

## Current Implementation

### Protected Pages:
- **Dashboard** - `withRole(DashboardPage, ['admin'])` - Admin only
- **Cashier** - `withRole(CashierPage, ['admin', 'cashier'])` - Admin & Cashier
- **Kitchen** - `withRole(KitchenPage, ['admin', 'kitchen'])` - Admin & Kitchen

### How It Works:
1. User logs in → User data saved to `localStorage`
2. User visits protected page → HOC checks authentication
3. If authenticated → Shows page
4. If not authenticated → Redirects to login
5. If wrong role → Redirects to appropriate page

## User Data Storage

User data is stored in `localStorage` after login:
```typescript
localStorage.setItem("user", JSON.stringify(user));
```

The HOC checks this on every page load to verify authentication.

## Benefits

✅ **Route Protection** - Automatic redirect if not logged in  
✅ **Role-Based Access** - Easy to restrict pages by role  
✅ **Reusable** - Use same HOC on multiple pages  
✅ **Clean Code** - Protection logic separated from page logic  

## Future Improvements

- Add JWT token verification
- Add session expiration
- Add refresh token support
- Add middleware for API routes

