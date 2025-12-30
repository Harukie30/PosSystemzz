# 🗄️ Database Readiness Review

## Critical Issues (Must Fix Before Database Integration)

### 1. **Stock Management - CRITICAL** ⚠️
**Problem**: When transactions are created, product stock is NOT being decremented. This will cause inventory discrepancies.

**Location**: `src/app/api/transactions/route.ts` (POST handler)

**Impact**: 
- Products can be sold even when out of stock
- Inventory counts will be incorrect
- No validation that sufficient stock exists

**Fix Required**:
```typescript
// In POST /api/transactions
// Before creating transaction:
1. Validate each item has sufficient stock
2. Decrement stock for each item
3. Create product movement records (out type)
4. Use database transaction to ensure atomicity
```

---

### 2. **Type Inconsistencies** ⚠️
**Problem**: ProductMovement interface differs between files:
- `src/app/api/data/movements.ts`: Uses `productName`, `timestamp`
- `src/lib/api/types.ts`: Uses `product`, `date`, `time` (no timestamp)

**Impact**: Data structure mismatch will cause errors when migrating

**Files Affected**:
- `src/app/api/data/movements.ts`
- `src/lib/api/types.ts`

**Fix Required**: Standardize ProductMovement interface across all files

---

### 3. **Missing Input Validation** ⚠️
**Problems**:
- No validation for negative numbers (price, stock, quantity)
- No validation for NaN values from parseInt/parseFloat
- No validation for empty strings
- No SKU uniqueness check
- No email/username format validation for users

**Locations**:
- `src/app/api/products/route.ts` (POST, PUT)
- `src/app/api/transactions/route.ts` (POST)
- `src/app/api/auth/login/route.ts` (POST)

**Example Issues**:
```typescript
// Current code allows:
parseInt("abc") // Returns NaN
parseFloat("") // Returns NaN
stock: -100 // Negative stock allowed
price: -50 // Negative price allowed
```

---

### 4. **ID Generation Race Conditions** ⚠️
**Problem**: Using `Math.max(...products.map(p => p.id)) + 1` for ID generation:
- Not thread-safe
- Can create duplicate IDs in concurrent requests
- Will fail with empty array edge case

**Location**: `src/app/api/products/route.ts` (POST)

**Fix Required**: Use database auto-increment or UUID generation

---

### 5. **Missing Error Handling for parseInt/parseFloat** ⚠️
**Problem**: No validation that parsed values are valid numbers

**Locations**:
- `src/app/api/products/[id]/route.ts` (GET, PUT, DELETE)
- `src/app/api/products/route.ts` (POST)
- `src/app/api/transactions/route.ts` (POST)

**Example**:
```typescript
const id = parseInt(idParam); // Could be NaN if idParam is invalid
if (isNaN(id)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
```

---

### 6. **No Transaction Rollback Mechanism** ⚠️
**Problem**: When creating a transaction fails partway through, there's no rollback:
- Stock might be decremented but transaction not saved
- Or transaction saved but stock not decremented

**Impact**: Data inconsistency

**Fix Required**: Implement database transactions (BEGIN/COMMIT/ROLLBACK)

---

## High Priority Issues

### 7. **Missing User ID in Transactions**
**Problem**: `userId` field exists in Transaction interface but is never set

**Location**: `src/app/api/transactions/route.ts` (POST)

**Impact**: Cannot track which user created which transaction

**Fix Required**: Extract user from auth token/session and set userId

---

### 8. **No Product Movement Tracking**
**Problem**: When stock changes (transactions, manual updates), no movement records are created

**Impact**: Cannot audit stock changes or generate reports

**Fix Required**: 
- Create movement record when transaction created
- Create movement record when stock manually updated
- Create movement record when product restocked

---

### 9. **Date/Time Format Inconsistency**
**Problem**: Dates stored as formatted strings instead of ISO format:
- `date: now.toLocaleDateString(...)` - locale-dependent
- `time: now.toLocaleTimeString(...)` - locale-dependent

**Impact**: 
- Sorting/filtering issues
- Timezone problems
- Database query difficulties

**Fix Required**: Store as ISO 8601 strings or timestamps

---

### 10. **Missing Receipt Number Uniqueness Check**
**Problem**: Receipt numbers generated from timestamp could collide:
```typescript
const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;
```

**Impact**: Duplicate receipt numbers possible

**Fix Required**: Check database for uniqueness or use UUID

---

### 11. **No Soft Delete for Products**
**Problem**: Products are permanently deleted, losing transaction history

**Impact**: Cannot view past transactions for deleted products

**Fix Required**: Implement soft delete (isDeleted flag) or archive

---

### 12. **Missing Pagination**
**Problem**: All products/transactions loaded at once

**Impact**: Performance issues with large datasets

**Fix Required**: Implement pagination in GET endpoints

---

## Medium Priority Issues

### 13. **No Input Sanitization**
**Problem**: User input not sanitized (XSS risk for product names, customer names)

**Fix Required**: Sanitize all string inputs

---

### 14. **Password Storage in Plain Text**
**Problem**: Passwords stored in plain text in login route

**Location**: `src/app/api/auth/login/route.ts`

**Fix Required**: Hash passwords with bcrypt before storing

---

### 15. **No Rate Limiting**
**Problem**: API endpoints have no rate limiting

**Impact**: Vulnerable to abuse/DDoS

**Fix Required**: Implement rate limiting middleware

---

### 16. **Missing CORS Configuration**
**Problem**: No explicit CORS configuration

**Impact**: May have issues with frontend-backend separation

---

### 17. **No Request Size Limits**
**Problem**: No validation for request body size

**Impact**: Memory issues with large payloads

---

### 18. **Missing Database Connection Error Handling**
**Problem**: No handling for database connection failures

**Fix Required**: Add try-catch for DB operations with proper error messages

---

## Low Priority / Nice to Have

### 19. **Dashboard Stats are Mocked**
**Problem**: Dashboard returns hardcoded stats

**Location**: `src/app/api/dashboard/route.ts`

**Fix Required**: Calculate from actual database data

---

### 20. **No Logging/Audit Trail**
**Problem**: No logging of important actions (who did what, when)

**Fix Required**: Implement audit logging

---

### 21. **Missing Environment Variables**
**Problem**: No .env file for configuration (DB connection, secrets)

**Fix Required**: Use environment variables for all configuration

---

### 22. **No Database Migrations Setup**
**Problem**: No migration system in place

**Fix Required**: Set up migration system (Prisma, TypeORM, or similar)

---

### 23. **Type Safety Issues**
**Problem**: Some places use `any` or loose typing

**Fix Required**: Strict TypeScript configuration

---

## Database Schema Recommendations

### Products Table
```sql
- id (PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR, NOT NULL)
- sku (VARCHAR, UNIQUE, NOT NULL)
- price (DECIMAL(10,2), NOT NULL, CHECK price >= 0)
- stock (INT, NOT NULL, CHECK stock >= 0)
- category (VARCHAR, NOT NULL)
- image (TEXT, NULLABLE)
- createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- isDeleted (BOOLEAN, DEFAULT FALSE) -- for soft delete
```

### Transactions Table
```sql
- id (PRIMARY KEY, UUID or AUTO_INCREMENT)
- receiptNumber (VARCHAR, UNIQUE, NOT NULL)
- customerName (VARCHAR, NOT NULL)
- total (DECIMAL(10,2), NOT NULL)
- userId (INT, FOREIGN KEY to users, NULLABLE)
- kitchenStatus (ENUM('preparing', 'completed'), DEFAULT 'preparing')
- createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### TransactionItems Table (Many-to-Many)
```sql
- id (PRIMARY KEY, AUTO_INCREMENT)
- transactionId (INT, FOREIGN KEY to transactions)
- productId (INT, FOREIGN KEY to products)
- quantity (INT, NOT NULL, CHECK quantity > 0)
- price (DECIMAL(10,2), NOT NULL) -- snapshot of price at time of sale
```

### ProductMovements Table
```sql
- id (PRIMARY KEY, AUTO_INCREMENT)
- productId (INT, FOREIGN KEY to products, NOT NULL)
- type (ENUM('in', 'out'), NOT NULL)
- quantity (INT, NOT NULL, CHECK quantity > 0)
- reason (VARCHAR, NOT NULL)
- userId (INT, FOREIGN KEY to users, NULLABLE)
- createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### Users Table
```sql
- id (PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR, UNIQUE, NOT NULL)
- passwordHash (VARCHAR, NOT NULL) -- bcrypt hash
- role (ENUM('admin', 'cashier', 'kitchen'), NOT NULL)
- createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- lastLogin (TIMESTAMP, NULLABLE)
```

---

## Action Items Checklist

### Before Database Integration:
- [ ] Fix stock decrementation on transaction creation
- [ ] Standardize ProductMovement interface
- [ ] Add input validation (negative numbers, NaN checks)
- [ ] Fix ID generation (use auto-increment)
- [ ] Add error handling for parseInt/parseFloat
- [ ] Implement database transactions for atomicity
- [ ] Set userId in transactions
- [ ] Create product movement records
- [ ] Standardize date/time format (ISO 8601)
- [ ] Ensure receipt number uniqueness

### During Database Integration:
- [ ] Set up database connection pooling
- [ ] Implement database transactions (BEGIN/COMMIT/ROLLBACK)
- [ ] Add connection error handling
- [ ] Set up database migrations
- [ ] Create indexes for frequently queried fields
- [ ] Add foreign key constraints

### After Database Integration:
- [ ] Implement soft delete for products
- [ ] Add pagination to GET endpoints
- [ ] Hash passwords with bcrypt
- [ ] Add input sanitization
- [ ] Implement rate limiting
- [ ] Add audit logging
- [ ] Calculate dashboard stats from database
- [ ] Set up environment variables

---

## Testing Recommendations

Before moving to database, test:
1. Concurrent transaction creation (race conditions)
2. Stock validation (prevent negative stock)
3. Invalid input handling (NaN, negative numbers, empty strings)
4. Large dataset performance (pagination needed?)
5. Error scenarios (DB connection failures, timeouts)

---

## Summary

**Critical Issues**: 6
**High Priority**: 6
**Medium Priority**: 5
**Low Priority**: 6

**Total Issues Found**: 23

**Most Critical**: Stock management not implemented - this will cause major inventory issues in production.

