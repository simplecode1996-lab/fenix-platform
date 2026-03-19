# Quick Deployment Checklist - Fenix Platform

## 🚀 Fastest Way to Deploy (30 minutes)

### Step 1: Push to GitHub (5 min)
```bash
git init
git add .
git commit -m "Initial commit - Fenix Platform"
git branch -M main
git remote add origin https://github.com/yourusername/fenix-platform.git
git push -u origin main
```

### Step 2: Deploy Database on Railway (5 min)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on PostgreSQL → "Data" tab → "Query"
5. Copy/paste `backend/database/schema.sql` → Execute
6. Copy/paste `backend/database/add_system_settings.sql` → Execute
7. Go to "Variables" tab → Copy all DB credentials

### Step 3: Deploy Backend on Railway (10 min)
1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Click on the service → "Settings":
   - Root Directory: `backend`
   - Start Command: `npm run build && npm start`
4. Go to "Variables" tab, add:
   ```
   NODE_ENV=production
   DB_HOST=[paste from PostgreSQL]
   DB_PORT=[paste from PostgreSQL]
   DB_NAME=[paste from PostgreSQL]
   DB_USER=[paste from PostgreSQL]
   DB_PASSWORD=[paste from PostgreSQL]
   JWT_SECRET=fenix_super_secret_key_2024_change_this
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-site.netlify.app
   ```
5. Go to "Settings" → "Networking" → "Generate Domain"
6. **Copy the backend URL** (e.g., `https://fenix-backend.up.railway.app`)

### Step 4: Deploy Frontend on Netlify (10 min)
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. Click "Show advanced" → "New variable":
   ```
   VITE_API_URL=[paste your Railway backend URL]
   ```
7. Click "Deploy site"
8. Wait for build to complete
9. **Copy the frontend URL** (e.g., `https://fenix-platform.netlify.app`)

### Step 5: Update CORS (2 min)
1. Go back to Railway → Backend service → "Variables"
2. Update `FRONTEND_URL` with your Netlify URL
3. Service will auto-redeploy

### Step 6: Test (3 min)
1. Open your Netlify URL
2. Login with: admin@fenix.com / admin123
3. Test creating a user
4. Test dashboard

---

## 📋 What You'll Share with Client

**Demo URL**: https://your-site.netlify.app

**Admin Login**:
- Email: admin@fenix.com
- Password: admin123

**Demo User** (create this first):
- Email: demo@fenix.com
- Password: demo123
- Accounts: 5

---

## 🔧 If Something Goes Wrong

### Backend won't start
- Check Railway logs: Service → "Deployments" → Click latest → "View Logs"
- Common issue: Missing environment variables

### Frontend can't connect to backend
- Check browser console (F12)
- Verify VITE_API_URL is correct
- Check CORS error → Update FRONTEND_URL in Railway

### Database connection fails
- Verify all DB_* variables match PostgreSQL service
- Check if PostgreSQL service is running

---

## 💰 Cost

**Everything is FREE for demo**:
- Railway: $5 free credit (enough for 1-2 months)
- Netlify: Free tier (100GB bandwidth)
- Total: $0

---

## 🎯 Alternative: Super Quick Test (5 min)

If you just need to show something NOW:

1. Keep backend running locally
2. Install ngrok: `npm install -g ngrok`
3. Run: `ngrok http 3000`
4. Copy the HTTPS URL
5. Update `frontend/src/services/api.ts`:
   ```typescript
   baseURL: 'https://abc123.ngrok.io'
   ```
6. Build frontend: `cd frontend && npm run build`
7. Drag `frontend/dist` folder to Netlify drop zone
8. Done! (URL expires in 2 hours)

---

## 📞 Need Help?

Check the full DEPLOYMENT_GUIDE.md for detailed troubleshooting.
