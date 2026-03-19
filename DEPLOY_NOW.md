# Deploy NOW - Quick Reference

## 🚀 Fastest Path to Production

### Step 1: Push to GitHub (5 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fenix-platform.git
git push -u origin main
```

### Step 2: Render - Database (3 min)
1. Go to https://render.com → Sign up
2. New + → PostgreSQL → Free plan
3. Name: `fenix-db` → Create
4. Copy "Internal Database URL"

### Step 3: Render - Initialize DB (2 min)
Click database → Connect → External Connection → Copy psql command:
```bash
psql "EXTERNAL_URL" -f backend/database/schema.sql
psql "EXTERNAL_URL" -f backend/database/add_system_settings.sql
psql "EXTERNAL_URL" -f backend/database/demo_data.sql
```

### Step 4: Render - Backend (5 min)
1. New + → Web Service → Connect GitHub repo
2. Settings:
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Environment → Add from Database → Select fenix-db
4. Add variables:
   ```
   NODE_ENV=production
   JWT_SECRET=fenix_secret_2024
   JWT_EXPIRES_IN=24h
   ```
5. Copy service URL: `https://fenix-backend.onrender.com`

### Step 5: Netlify - Frontend (5 min)
1. Go to https://netlify.com → Sign up
2. Add site → Import from GitHub
3. Settings:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/dist`
4. Environment variables:
   ```
   VITE_API_URL=https://fenix-backend.onrender.com
   ```
5. Deploy → Copy URL

### Step 6: Update CORS (1 min)
Render → Backend → Environment:
```
FRONTEND_URL=https://your-site.netlify.app
```

### Step 7: Test (2 min)
Open Netlify URL → Login: admin@fenix.com / admin123

---

## ✅ Done! Share with Client

**URL**: https://your-site.netlify.app

**Credentials**:
- Admin: admin@fenix.com / admin123
- Demo: demo1@fenix.com / demo123

---

## 🔄 Update Later
```bash
git add .
git commit -m "Update"
git push
```
Both Render and Netlify auto-deploy!

---

## 📱 What to Show Client

1. **Dashboard** - Account progression
2. **Create User** - Admin functionality
3. **Accounts** - View all accounts
4. **Payments** - Request and manage
5. **Language** - EN/ES switch
6. **Mobile** - Responsive design

---

## 💡 Pro Tips

- Change admin password after first login
- Create 2-3 demo users for client
- Test on mobile before sharing
- Monitor Render logs first 24 hours
- Database free for 90 days

---

## 🆘 Quick Fixes

**Build fails?**
→ Check Render logs

**Can't connect?**
→ Check VITE_API_URL and FRONTEND_URL

**CORS error?**
→ URLs must match exactly (no trailing /)

**Database error?**
→ Check DATABASE_URL in Render

---

**Total Time: 23 minutes**
**Cost: $0 (free for 90 days)**

🎉 **You're live!**
