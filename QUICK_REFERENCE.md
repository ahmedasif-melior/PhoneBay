# PhoneBay Role Management - Quick Reference Guide

## 🚀 Quick Start

### 1. Extract & Setup
```bash
unzip phonbay-updated.zip
npm install
npm run dev
```

### 2. Default Admin Login
- **Email**: `ahmed.asif@devsatmelior.com`
- **Password**: `PhoneBayAdmin!2026`
- **URL**: `http://localhost:3000/auth/admin/sign-in`

### 3. Signup URLs
- **User**: `/auth/user/sign-up` 
- **Shop**: `/auth/shop/sign-up`
- **Admin**: Only via API `/api/admin/admins` (existing admin only)

---

## 📋 Role Quick Reference

| Feature | USER | SHOP | ADMIN |
|---------|------|------|-------|
| Browse Listings | ✅ | ✅ | ✅ |
| Sell Items | ✅ | ✅ | ❌ |
| Dashboard | `/dashboard` | `/dashboard/shop` | `/dashboard/admin` |
| Create Admin | ❌ | ❌ | ✅ |
| Approve Shops | ❌ | ❌ | ✅ |
| Block Users | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |
| Device Verification | ✅ | ✅ | ✅ |
| Can be Blocked | ✅ | ✅ | ❌ |
| Needs Approval | ❌ | ✅ | N/A |

---

## 🔑 Key Database Tables

### users
```
id, email, password_hash, full_name, role (USER/SHOP/ADMIN), 
shop_id, is_blocked, blocked_reason, trust_score, ...
```

### shop_profiles
```
id, shop_name, shop_email, verified, verification_status (pending/approved/rejected),
services, verified_at, verified_by_admin_id, is_active, ...
```

### admin_audit_logs
```
id, admin_id, action, entity_type, entity_id, changes, created_at
```

---

## 🔌 Essential API Endpoints

### Authentication
```
POST /api/auth/signup         → Create USER or SHOP account
POST /api/auth/signin         → Login
POST /api/auth/signout        → Logout
GET  /api/auth/me             → Current user info
```

### Admin Functions
```
GET  /api/admin/users         → List all users
POST /api/admin/users         → Block/unblock user
GET  /api/admin/admins        → List admins
POST /api/admin/admins        → Create new admin (ADMIN only)
GET  /api/admin/shops         → List shops
POST /api/admin/shops         → Approve/reject shop
```

---

## 💡 Common Tasks

### Create Admin Account
```bash
curl -X POST http://localhost:3000/api/admin/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@phonebay.com",
    "fullName": "Admin Name",
    "password": "SecurePass123"
  }'
```

### Approve Shop
```bash
curl -X POST http://localhost:3000/api/admin/shops \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "shp_abc123",
    "status": "approved",
    "notes": "Verified business"
  }'
```

### Block User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_xyz789",
    "action": "block",
    "reason": "Fraudulent activity"
  }'
```

---

## 🔍 Database Queries

### Find Admin Users
```sql
SELECT * FROM users WHERE role = 'ADMIN';
```

### Find Pending Shops
```sql
SELECT * FROM shop_profiles WHERE verification_status = 'pending';
```

### Find Blocked Users
```sql
SELECT * FROM users WHERE is_blocked = 1;
```

### View Admin Actions
```sql
SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50;
```

### Find Shop's User
```sql
SELECT * FROM users WHERE shop_id = 'shp_abc123';
```

---

## ⚠️ Important Notes

1. **User Isolation**: Users can ONLY see their own data
   - Middleware enforces route access
   - API checks role on every request

2. **Shop Verification**: Shops start in "pending" state
   - Admin must approve before full access
   - All approvals logged in audit trail

3. **Admin Creation**: Only existing admins can create new admins
   - No signup form for admin
   - API endpoint requires current admin auth

4. **Blocked Users**: Cannot access ANY protected routes
   - Redirect to home page automatically
   - All API calls return 401

5. **Audit Logging**: All admin actions recorded
   - Who did it (admin_id)
   - What action
   - What entity
   - What changed
   - When it happened

---

## 🧪 Test Flow

### Test 1: User Sign Up & Isolation
1. Sign up as user → `accountPurpose: "buyer"`
2. Access `/dashboard` → ✅ Works
3. Try `/dashboard/admin` → ❌ Redirects to dashboard
4. Try `/dashboard/shop` → ❌ Redirects to dashboard

### Test 2: Shop Verification
1. Sign up as shop → `accountPurpose: "shop"`
2. Shop profile created with `verification_status: "pending"`
3. Access `/dashboard/shop` → Shows "Pending Verification"
4. Admin approves via API
5. Shop can now use dashboard fully

### Test 3: Admin Management
1. Current admin creates new admin via API
2. New admin signs in
3. New admin can create users, shops, block accounts
4. All actions logged in audit table

---

## 🛠️ Environment Variables

```bash
# Required for authentication
JWT_SECRET=your-secret-key-here

# Optional - customize admin account
ADMIN_EMAIL=custom@email.com
ADMIN_PASSWORD=CustomPassword123

# Optional - database location
DATABASE_URL=file:./data/phonebay.db
```

---

## 📚 Full Documentation Files

- **`ROLES_AND_PERMISSIONS.md`** - Complete system documentation
- **`IMPLEMENTATION_SUMMARY.md`** - What was changed and why
- **`QUICK_REFERENCE.md`** - This file

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin can't log in | Check email/password, verify ADMIN role in DB |
| Shop stuck pending | Admin needs to approve via `/api/admin/shops` |
| User accessing shop route | Clear cache, check middleware, restart server |
| Can't create admin | Must be logged in as ADMIN, use `/api/admin/admins` |
| Audit logs empty | Check database has `admin_audit_logs` table |
| Blocked user not blocked | Restart server, clear cache |

---

## 📞 File Structure

```
src/
├── server/
│   ├── repositories/
│   │   ├── users.ts          ✅ Updated
│   │   ├── shops.ts          ✨ NEW
│   │   └── audit-logs.ts     ✨ NEW
│   ├── schema.sql             ✅ Updated
│   ├── types.ts               ✅ Updated
│   ├── auth.ts                (unchanged)
│   ├── http.ts                ✅ Updated
│   └── seed.ts                ✅ Updated
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── signup/route.ts   ✅ Updated
│   │   └── admin/
│   │       ├── users/route.ts    ✨ NEW
│   │       ├── admins/route.ts   ✨ NEW
│   │       └── shops/route.ts    ✨ NEW
│   └── (auth)/ & (dashboard)/  (existing routes work as-is)
└── middleware.ts              ✨ NEW

Documentation/
├── ROLES_AND_PERMISSIONS.md   ✨ NEW
├── IMPLEMENTATION_SUMMARY.md  ✨ NEW
└── QUICK_REFERENCE.md         ✨ This file
```

---

**Last Updated**: 2026-09-02  
**Status**: ✅ Ready to Deploy
