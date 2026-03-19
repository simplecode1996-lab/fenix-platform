# Supabase IPv6 Connection Issue Fix

## Problem
```
Error: connect ENETUNREACH 2a05:d018:135e:16d4:e015:44c3:9e5f:b747:5432
code: 'ENETUNREACH'
```

Render's free tier doesn't support IPv6 connections, but Supabase's direct connection resolves to IPv6.

## Solution: Use Supabase Connection Pooler

### Step 1: Get Pooler Connection String from Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project: `bhtosjlllltsimoyabis`
3. Go to: Settings → Database
4. Scroll to "Connection string"
5. Select mode: **Session** (not Transaction or Direct)
6. Copy the connection string - it should look like:
   ```
   postgresql://postgres.bhtosjlllltsimoyabis:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Replace Password in Connection String

Replace `[YOUR-PASSWORD]` with URL-encoded password: `fenix123%23%40%21%40`

Final connection string:
```
postgresql://postgres.bhtosjlllltsimoyabis:fenix123%23%40%21%40@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 3: Update DATABASE_URL in Render

1. Go to: https://dashboard.render.com
2. Select: `fenix-backend-g6pv`
3. Go to: Environment tab
4. Find: `DATABASE_URL`
5. Click Edit
6. Replace with the new pooler connection string
7. Save Changes

Render will auto-redeploy.

## Why This Works

- **Direct connection** (port 5432): Uses IPv6, not supported by Render free tier
- **Pooler connection** (port 6543): Uses IPv4, works with Render
- **Session mode**: Best for backend applications with persistent connections

## Alternative: Use Supabase IPv4 Address

If pooler doesn't work, you can try using the IPv4 address directly:

1. Find Supabase IPv4 address:
   ```bash
   nslookup db.bhtosjlllltsimoyabis.supabase.co
   ```

2. Use the IPv4 address in connection string:
   ```
   postgresql://postgres:fenix123%23%40%21%40@[IPV4-ADDRESS]:5432/postgres?sslmode=require
   ```

## Verification

After updating, check Render logs for:
```
✓ Database connected successfully
```

Then test login:
```bash
curl -X POST https://fenix-backend-g6pv.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fenix.com","password":"admin123"}'
```

Should return JWT token instead of 500 error.
