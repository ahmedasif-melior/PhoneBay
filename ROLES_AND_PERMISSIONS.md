# PhoneBay Role-Based Access Control (RBAC) System

## Overview
This document outlines the complete role management system for PhoneBay, including user roles, shop management, admin functions, and user isolation.

---

## User Roles

### 1. **USER Role** 
Regular marketplace users who can buy and sell individual devices.

#### Permissions:
- ✅ Sign up and authenticate
- ✅ Browse marketplace listings
- ✅ View seller profiles and reviews
- ✅ Purchase devices (create orders)
- ✅ List devices for sale
- ✅ Request device verification
- ✅ Access `/dashboard` routes (not `/admin` or `/shop`)
- ✅ Manage personal profile
- ✅ Send messages to other users
- ✅ Leave reviews

#### Restrictions:
- ❌ Cannot access admin panel
- ❌ Cannot access shop dashboard
- ❌ Cannot view audit logs
- ❌ Cannot manage other users
- ❌ Isolated to their own data only

#### Access URL:
- Dashboard: `/dashboard`
- Auth: `/auth/user/sign-up`, `/auth/user/sign-in`

---

### 2. **SHOP Role**
Business accounts that operate as mobile phone shops with verification and certification capabilities.

#### Permissions:
- ✅ Sign up as a shop (must apply for verification)
- ✅ Create and manage shop profile
- ✅ List multiple devices
- ✅ Request device verification/testing
- ✅ Access device certification features
- ✅ Manage shop inventory
- ✅ Access `/dashboard/shop` routes
- ✅ View shop-specific analytics
- ✅ Manage shop staff/members (future)
- ✅ Access shop reviews and ratings
- ✅ Apply for services (buy-back, repairs, etc.)

#### Restrictions:
- ❌ Cannot access admin panel
- ❌ Cannot approve/reject other shops
- ❌ Cannot manage user accounts
- ❌ Cannot access admin audit logs
- ❌ Cannot approve their own shop (requires admin approval)

#### Access URL:
- Dashboard: `/dashboard/shop`
- Auth: `/auth/shop/sign-up`, `/auth/shop/sign-in`

#### Shop Verification Flow:
1. User signs up with `accountPurpose: "shop"`
2. User is assigned **SHOP role**
3. Shop profile is created in `shop_profiles` table
4. Verification status starts as **"pending"**
5. Admin reviews and approves/rejects
6. Once approved, shop status becomes **"approved"** and `verified = true`
7. Shop can now access full shop dashboard

---

### 3. **ADMIN Role**
System administrators with full platform access and control.

#### Permissions:
- ✅ Access entire admin panel (`/dashboard/admin`)
- ✅ View all users and their details
- ✅ Block/unblock users
- ✅ View all shops
- ✅ Approve/reject shop verification requests
- ✅ Create new admin accounts (admins only)
- ✅ View and manage listings
- ✅ View orders and disputes
- ✅ Generate reports
- ✅ View audit logs of all admin actions
- ✅ Manage site settings
- ✅ View verification requests
- ✅ Access admin dashboard analytics

#### Restrictions:
- ❌ Cannot have shop accounts
- ❌ Admin accounts are never auto-created
- ❌ Only existing admins can create new admins

#### Access URL:
- Dashboard: `/dashboard/admin`
- Auth: `/auth/admin/sign-in` only (no sign-up)

#### Admin Creation Flow:
1. Only an existing ADMIN can create new admins
2. Use API endpoint: `POST /api/admin/admins`
3. New admin account is created with provided email and password
4. Action is logged in audit logs
5. New admin can immediately sign in and access admin panel

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  city            TEXT,
  role            TEXT DEFAULT 'USER', -- USER | SHOP | ADMIN
  shop_id         TEXT REFERENCES shop_profiles(id),
  email_verified  INTEGER DEFAULT 0,
  phone_verified  INTEGER DEFAULT 0,
  trust_score     REAL DEFAULT 7.5,
  is_blocked      INTEGER DEFAULT 0,
  blocked_reason  TEXT,
  blocked_at      TEXT,
  created_at      TEXT DEFAULT datetime('now'),
  updated_at      TEXT DEFAULT datetime('now')
);
```

### Shop Profiles Table
```sql
CREATE TABLE shop_profiles (
  id                   TEXT PRIMARY KEY,
  shop_name            TEXT NOT NULL,
  shop_email           TEXT NOT NULL UNIQUE,
  verified             INTEGER DEFAULT 0,
  verification_status  TEXT DEFAULT 'pending', -- pending | approved | rejected
  services             TEXT DEFAULT '',
  verification_notes   TEXT,
  verified_at          TEXT,
  verified_by_admin_id TEXT REFERENCES users(id),
  is_active            INTEGER DEFAULT 1,
  created_at           TEXT DEFAULT datetime('now'),
  updated_at           TEXT DEFAULT datetime('now')
);
```

### Admin Audit Logs Table
```sql
CREATE TABLE admin_audit_logs (
  id           TEXT PRIMARY KEY,
  admin_id     TEXT NOT NULL REFERENCES users(id),
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  changes      TEXT, -- JSON
  created_at   TEXT DEFAULT datetime('now')
);
```

---

## User Isolation & Access Control

### Frontend Middleware (`src/middleware.ts`)
Enforces role-based route protection:

- **USER routes**: Can only access `/dashboard/*` (not admin or shop)
- **SHOP routes**: Can only access `/dashboard/shop/*` and `/auth/shop/*`
- **ADMIN routes**: Can access `/dashboard/admin/*` and `/auth/admin/*`
- **Blocked users**: Automatically redirected to home page

### Backend Middleware
All API routes use `requireUser()`, `requireAdmin()`, or `requireShop()` helpers to enforce permissions.

---

## API Endpoints

### Authentication
```
POST /api/auth/signup      - Sign up (USER or SHOP)
POST /api/auth/signin      - Sign in
POST /api/auth/signout     - Sign out
GET  /api/auth/me          - Get current user
```

### Admin Management
```
GET  /api/admin/users              - List all users
POST /api/admin/users              - Block/unblock user
GET  /api/admin/admins             - List all admins
POST /api/admin/admins             - Create new admin (admin only)
GET  /api/admin/shops              - List all shops
POST /api/admin/shops              - Approve/reject shop verification
```

### Shop Management
```
GET  /api/shop/verification        - Get shop verification requests
POST /api/shop/verification/[id]   - Complete verification for a device
```

---

## Implementation Checklist

### Backend
- [x] Update user schema with `role`, `shop_id`, `is_blocked` fields
- [x] Create `shop_profiles` table with verification status
- [x] Create `admin_audit_logs` table
- [x] Create shops repository (`shopsRepo`)
- [x] Create audit logs repository (`auditLogsRepo`)
- [x] Update users repository with role-based queries
- [x] Add role-checking utilities in `http.ts`
- [x] Create `requireAdmin()` and `requireShop()` helpers
- [x] Update signup to create shop profile when `accountPurpose === "shop"`
- [x] Create admin management APIs
- [x] Create shop verification APIs
- [x] Create user blocking/unblocking APIs
- [x] Add audit logging to all admin actions

### Frontend
- [x] Create middleware for route protection
- [x] Update type definitions
- [x] Update seed data for new schema

### Testing
- [ ] Test user sign-up and access
- [ ] Test shop sign-up and verification flow
- [ ] Test admin creation
- [ ] Test user isolation (users can't access shop/admin routes)
- [ ] Test blocked users can't access anything
- [ ] Test admin can approve/reject shops
- [ ] Test audit logs capture admin actions

---

## Usage Examples

### Sign Up as Regular User
```bash
POST /api/auth/signup
{
  "fullName": "Ahmed Khan",
  "email": "ahmed@example.com",
  "password": "SecurePass123",
  "accountPurpose": "buyer"  # USER role
}
```

### Sign Up as Shop
```bash
POST /api/auth/signup
{
  "fullName": "Ahmed Mobile Store",
  "email": "shop@ahmedmobile.pk",
  "password": "SecurePass123",
  "accountPurpose": "shop"  # SHOP role + creates shop_profiles entry
}
```

### Approve Shop (Admin Only)
```bash
POST /api/admin/shops
{
  "shopId": "shp_abc123",
  "status": "approved",
  "notes": "Verified business license and ownership"
}
```

### Block User (Admin Only)
```bash
POST /api/admin/users
{
  "userId": "usr_xyz789",
  "action": "block",
  "reason": "Fraudulent activity detected"
}
```

### Create New Admin (Admin Only)
```bash
POST /api/admin/admins
{
  "email": "newadmin@phonebay.com",
  "fullName": "Admin Name",
  "password": "StrongPassword123"
}
```

---

## Security Considerations

1. **User Isolation**: Users can only access their own data through middleware and API guards
2. **Role Enforcement**: All endpoints check role before processing
3. **Admin-Only Actions**: Admin creation, user blocking, and shop approval require ADMIN role
4. **Audit Trail**: All admin actions are logged for accountability
5. **Blocked Users**: Blocked users cannot access any protected routes
6. **Session Validation**: Invalid/expired sessions are rejected

---

## Current Admin Setup

The system ships with one manual admin account:

**Email**: `ahmed.asif@devsatmelior.com` (configurable via `ADMIN_EMAIL` env var)
**Password**: `PhoneBayAdmin!2026` (configurable via `ADMIN_PASSWORD` env var)

To change these, update environment variables before first run:
```
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourSecurePassword
```

---

## Future Enhancements

1. **Role Permissions Matrix**: More granular permissions per role
2. **Shop Staff Accounts**: Admins for individual shops
3. **API Keys**: For programmatic access with role-based permissions
4. **Two-Factor Authentication**: Additional security for admins
5. **Activity Dashboard**: Real-time monitoring of user and shop activities
6. **Automated Shop Verification**: AI-based preliminary checks
7. **Permission Templates**: Reusable permission sets for consistent role management

---

## Troubleshooting

### User can't access admin panel
- Check user role: `SELECT role FROM users WHERE id = 'usr_xxx'`
- Verify middleware is active
- Clear browser cache and cookies

### Shop can't be verified
- Check verification status: `SELECT verification_status FROM shop_profiles WHERE id = 'shp_xxx'`
- Verify admin account exists with ADMIN role
- Check audit logs for errors

### Admin account not working
- Verify email/password are correct
- Check user role is "ADMIN": `SELECT role FROM users WHERE email = '...'`
- Clear browser cache
- Check for "is_blocked" flag

---

Last Updated: 2026-09-02
