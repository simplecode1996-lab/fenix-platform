# Deployment Guide: Render + Netlify (RECOMMENDED)

## Why Render + Netlify?
- ✅ Render: Free tier for backend + PostgreSQL
- ✅ Netlify: Free tier for frontend
- ✅ Both have excellent free tiers
- ✅ Easy GitHub integration
- ✅ No CLI required (all via web UI)
- ✅ Professional setup

**Total Time: 40 minutes**
**Cost: $0**

---

## Prerequisites

- GitHub account (free)
- Your code ready to push

---

## Step 1: Push Code to GitHub (10 min)

### A. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fenix-platform`
3. Make it Private (recommended for client projects)
4. Don't initialize with README (we have code already)
5. Click "Create repository"

### B. Push Your Code

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Fenix Platform"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fenix-platform.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy PostgreSQL Database on Render (5 min)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "PostgreSQL"
4. Configure:
   - **Name**: `fenix-db`
   - **Database**: `fenix_platform`
   - **User**: `fenix_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
5. Click "Create Database"
6. Wait 2-3 minutes for provisioning

### Get Database Connection Details

Once created, you'll see:
- **Internal Database URL**: Use this for backend
- **External Database URL**: Use this for local access

**Copy the Internal Database URL** - you'll need it soon.

---

## Step 3: Initialize Database Schema (5 min)

### Option A: Using Render Web Shell (Easiest)

1. In Render, click on your `fenix-db` database
2. Click "Connect" → "External Connection"
3. Copy the `psql` command shown
4. Open your local terminal and run that command
5. Once connected, run:

```sql
-- Copy and paste contents of backend/database/schema.sql
-- Then copy and paste contents of backend/database/add_system_settings.sql
```

### Option B: Using Local psql

```bash
# Export your local database
pg_dump -U postgres -d fenix_platform -p 5433 > fenix_demo.sql

# Import to Render (use External Database URL from Render)
psql "postgresql://fenix_user:password@host.render.com/fenix_platform" < fenix_demo.sql
```

### Option C: Fresh Start (Recommended for Demo)

```bash
# Use External Database URL from Render
psql "EXTERNAL_DATABASE_URL" -f backend/database/schema.sql
psql "EXTERNAL_DATABASE_URL" -f backend/database/add_system_settings.sql
```

---

## Step 4: Deploy Backend on Render (10 min)

1. In Render dashboard, click "New +" → "Web Service"
2. Click "Connect a repository"
3. Select your `fenix-platform` repository
4. Configure:
   - **Name**: `fenix-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Click "Advanced" → Add Environment Variables:

```
NODE_ENV=production
DB_HOST=[from Internal Database URL - just the host part]
DB_PORT=5432
DB_NAME=fenix_platform
DB_USER=fenix_user
DB_PASSWORD=[from Internal Database URL]
JWT_SECRET=fenix_super_secret_key_2024_change_this_in_production
JWT_EXPIRES_IN=24h
```

**TIP**: Render can auto-link database. Click "Add Environment Variable" → "Add from Database" → Select your database → It will add DATABASE_URL automatically.

6. Click "Create Web Service"

### Update Backend to Use DATABASE_URL

If you use Render's DATABASE_URL, update `backend/src/config/database.ts`:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (Render), otherwise use individual vars
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

export default pool;
```

### Get Backend URL

Once deployed (takes 3-5 minutes), you'll see your service URL:
- Example: `https://fenix-backend.onrender.com`

**Copy this URL** - you'll need it for frontend.

---

## Step 5: Update Backend CORS (2 min)

1. In Render, go to your backend service
2. Go to "Environment" tab
3. Add new variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-site.netlify.app` (we'll update this after Netlify)

For now, you can use `*` temporarily:
- **Key**: `FRONTEND_URL`
- **Value**: `*`

---

## Step 6: Deploy Frontend on Netlify (10 min)

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose "Deploy with GitHub"
5. Select your `fenix-platform` repository
6. Configure:
   - **Branch**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

7. Click "Show advanced" → "Add environment variable":
   - **Key**: `VITE_API_URL`
   - **Value**: `https://fenix-backend.onrender.com` (your Render backend URL)

8. Click "Deploy site"

Wait 2-3 minutes for build to complete.

### Get Frontend URL

Once deployed, you'll see your site URL:
- Example: `https://random-name-123.netlify.app`

### Customize Domain (Optional)

1. Click "Site settings" → "Change site name"
2. Enter: `fenix-platform` (or any available name)
3. Your URL becomes: `https://fenix-platform.netlify.app`

---

## Step 7: Update Backend CORS with Final Frontend URL (2 min)

1. Go back to Render → Your backend service
2. Go to "Environment" tab
3. Update `FRONTEND_URL`:
   - **Value**: `https://fenix-platform.netlify.app` (your actual Netlify URL)
4. Click "Save Changes"

Backend will automatically redeploy.

---

## Step 8: Create Clean Demo Data (5 min)

### Option A: Via API (After Deployment)

1. Open your Netlify site
2. Login as admin: admin@fenix.com / admin123
3. Create demo users:
   - demo1@fenix.com / demo123 (5 accounts)
   - demo2@fenix.com / demo123 (3 accounts)
4. Create some accounts for each user
5. Test payment requests

### Option B: Via SQL (Before Deployment)

Create `backend/database/demo_data.sql`:

```sql
-- Insert demo users (passwords are hashed for 'demo123')
INSERT INTO users (email, password_hash, first_name, last_name, profile, wallet, phone, dni, registered_accounts_count, allowed_accounts_count)
VALUES 
  ('demo1@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'Demo', 'User 1', 'user', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '555-0001', '12345678', 5, 10),
  ('demo2@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'Demo', 'User 2', 'user', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', '555-0002', '87654321', 3, 10);

-- Insert demo accounts for demo1 (user_code will be 2 if admin is 1)
INSERT INTO user_accounts (account_number, user_code, user_wallet, paid_amount, investment_amount, level_1_date)
VALUES 
  (1, 2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP),
  (2, 2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP),
  (3, 2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP);

-- Update level 2 for account 1 (when 3 accounts exist)
UPDATE user_accounts SET level_2_date = CURRENT_TIMESTAMP WHERE account_number = 1;
```

Then run:
```bash
psql "EXTERNAL_DATABASE_URL" -f backend/database/demo_data.sql
```

---

## Step 9: Test Your Deployment (5 min)

1. Open your Netlify URL: `https://fenix-platform.netlify.app`
2. Test login:
   - Admin: admin@fenix.com / admin123
   - Demo: demo1@fenix.com / demo123
3. Test features:
   - Dashboard loads
   - Create user works
   - Create account works
   - Payment request works
   - Language switch (EN/ES) works
4. Test on mobile (responsive design)

---

## Step 10: Share with Client

**Demo URL**: https://fenix-platform.netlify.app

**Credentials**:
- **Admin**: admin@fenix.com / admin123
- **Demo User**: demo1@fenix.com / demo123

**Features to Show**:
1. Dashboard with account progression
2. User management (admin only)
3. Account creation
4. Payment requests
5. Multi-language support (EN/ES)
6. Responsive design (mobile-friendly)

---

## 🔄 How to Update After Changes

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push
```
Render will auto-deploy in 2-3 minutes.

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push
```
Netlify will auto-deploy in 1-2 minutes.

---

## 📊 Monitoring

### Render Dashboard
- View logs: Backend service → "Logs" tab
- Check status: Backend service → "Events" tab
- Database metrics: Database → "Metrics" tab

### Netlify Dashboard
- View deploys: Site → "Deploys" tab
- Check logs: Click on any deploy → "Deploy log"
- Analytics: Site → "Analytics" tab

---

## 🆘 Troubleshooting

### Backend won't start
1. Check Render logs: Service → "Logs"
2. Common issues:
   - Missing environment variables
   - Database connection failed
   - Build command failed

**Solution**: Verify all environment variables are set correctly.

### Frontend can't connect to backend
1. Open browser console (F12)
2. Check for CORS errors
3. Verify `VITE_API_URL` in Netlify environment variables
4. Verify `FRONTEND_URL` in Render backend variables

**Solution**: Make sure URLs match exactly (no trailing slash).

### Database connection fails
1. Check if database is running in Render
2. Verify connection string is correct
3. Check if SSL is enabled

**Solution**: Add SSL configuration to database pool:
```typescript
ssl: { rejectUnauthorized: false }
```

### Build fails on Render
1. Check Node.js version
2. Check if `npm run build` works locally
3. Check TypeScript errors

**Solution**: Add `"engines"` to `backend/package.json`:
```json
{
  "engines": {
    "node": "20.x"
  }
}
```

---

## 💰 Cost Breakdown

### Free Tier Limits (More than enough for demo)

**Render Free Tier**:
- 750 hours/month web service
- PostgreSQL: 90 days free, then $7/month
- 100GB bandwidth

**Netlify Free Tier**:
- 100GB bandwidth
- 300 build minutes/month
- Unlimited sites

**Total Cost**: $0 for first 90 days, then $7/month for database

---

## 🎯 Summary

You now have:
- ✅ Backend deployed on Render
- ✅ PostgreSQL database on Render
- ✅ Frontend deployed on Netlify
- ✅ Automatic deployments on git push
- ✅ Professional URLs
- ✅ HTTPS enabled
- ✅ Clean demo data

**Share with client**: https://fenix-platform.netlify.app

---

## 📝 Quick Reference

```bash
# Push updates
git add .
git commit -m "Your message"
git push

# Check backend logs
# Go to render.com → Your service → Logs

# Check frontend logs
# Go to netlify.com → Your site → Deploys → Latest deploy

# Database access
psql "EXTERNAL_DATABASE_URL"
```

---

## Next Steps

1. ✅ Test all features thoroughly
2. ✅ Create demo user accounts
3. ✅ Prepare demo script for client
4. ✅ Change admin password (optional)
5. ✅ Monitor for any errors in first 24 hours
