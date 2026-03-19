# DEPLOY NOW - Current Status & Fix

## � CURRENT ISSUE
Backend is trying to connect to localhost instead of Supabase database.

## ✅ WHAT'S WORKING
- Database: Supabase deployed at `db.bhtosjlllltsimoyabis.supabase.co`
- Frontend: Netlify deployed at `https://fenix-initial.netlify.app`
- Backend: Render service at `https://fenix-backend-g6pv.onrender.com`

## 🔧 FIX REQUIRED - Set Environment Variable in Render

### Go to Render Dashboard NOW:
1. Open: https://dashboard.render.com
2. Click on service: `fenix-backend-g6pv`
3. Go to "Environment" tab
4. Add this variable:

```
DATABASE_URL=postgresql://postgres:fenix123%23%40%21%40@db.bhtosjlllltsimoyabis.supabase.co:5432/postgres
```

5. Click "Save Changes"
6. Render will auto-redeploy (takes 2-3 minutes)

### Other Required Environment Variables (should already be set):
```
JWT_SECRET=fenix-super-secret-key-2024
NODE_ENV=production
```

## 📝 Connection Details

### Supabase Database
- Host: `db.bhtosjlllltsimoyabis.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: `fenix123#@!@`
- URL-encoded password: `fenix123%23%40%21%40`

### Backend (Render)
- URL: https://fenix-backend-g6pv.onrender.com
- Health check: https://fenix-backend-g6pv.onrender.com/health
- Repository: https://github.com/simplecode1996-lab/fenix-platform

### Frontend (Netlify)
- URL: https://fenix-initial.netlify.app
- API configured to: https://fenix-backend-g6pv.onrender.com

## 🧪 Test After Fix

### 1. Test Backend Health
```bash
curl https://fenix-backend-g6pv.onrender.com/health
```
Should return: `{"status":"ok","message":"Fenix Platform API is running"}`

### 2. Test Login API
```bash
curl -X POST https://fenix-backend-g6pv.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fenix.com","password":"admin123"}'
```
Should return JWT token

### 3. Test Frontend
Open: https://fenix-initial.netlify.app
Login: admin@fenix.com / admin123

## 📊 What Changed

Fixed `backend/src/config/database.ts` to support DATABASE_URL:
- Now checks for DATABASE_URL first (production)
- Falls back to individual env vars (local development)
- Added SSL support for Supabase connection

## ⚠️ Known Issues

### Render Free Tier
- Service sleeps after 15 minutes of inactivity
- Takes 50+ seconds to wake up on first request
- Solution: Upgrade to paid tier or use UptimeRobot

### CORS Already Fixed
Backend allows: `https://fenix-initial.netlify.app`

## 🎯 Next Steps After Fix

1. Wait for Render to finish deploying (2-3 min)
2. Test health endpoint
3. Test login from frontend
4. Share URL with client: https://fenix-initial.netlify.app

---

**Login Credentials:**
- Admin: admin@fenix.com / admin123
- Demo User 1: demo1@fenix.com / demo123
- Demo User 2: demo2@fenix.com / demo123
