# Manual Deployment Guide (No GitHub Required)

## Option 1: Railway CLI (RECOMMENDED)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open a browser window. Sign up/login with email (no GitHub needed).

### Step 3: Create New Project

```bash
railway init
```

Choose "Empty Project" and give it a name (e.g., "fenix-platform")

### Step 4: Deploy PostgreSQL Database

```bash
# Add PostgreSQL to your project
railway add --database postgres
```

### Step 5: Initialize Database Schema

```bash
# Get database connection details
railway variables

# Connect to database and run schema
railway run psql < backend/database/schema.sql
railway run psql < backend/database/add_system_settings.sql
```

If the above doesn't work, use this alternative:
```bash
# Get the DATABASE_URL
railway variables | grep DATABASE_URL

# Use psql directly (install PostgreSQL client if needed)
psql [DATABASE_URL] -f backend/database/schema.sql
psql [DATABASE_URL] -f backend/database/add_system_settings.sql
```

### Step 6: Deploy Backend

```bash
# Navigate to backend folder
cd backend

# Link to Railway project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=fenix_super_secret_key_2024_change_this
railway variables set JWT_EXPIRES_IN=24h

# Deploy backend
railway up
```

Railway will automatically detect Node.js and deploy.

### Step 7: Get Backend URL

```bash
railway domain
```

Or generate a domain:
```bash
railway domain --generate
```

Copy the URL (e.g., `https://fenix-backend.up.railway.app`)

### Step 8: Add Frontend URL to Backend

```bash
railway variables set FRONTEND_URL=https://your-netlify-site.netlify.app
```

---

## Option 2: Render.com (No CLI, Web Upload)

Render.com allows direct upload without GitHub or CLI.

### Step 1: Create Account

Go to https://render.com and sign up with email.

### Step 2: Deploy PostgreSQL

1. Click "New +" → "PostgreSQL"
2. Name: `fenix-db`
3. Database: `fenix_platform`
4. User: `fenix_user`
5. Region: Choose closest to you
6. Click "Create Database"
7. Wait for provisioning (~2 minutes)

### Step 3: Initialize Database

1. Click on your database
2. Copy "External Database URL"
3. Use a PostgreSQL client (like DBeaver, pgAdmin, or command line):

```bash
psql [External-Database-URL] -f backend/database/schema.sql
psql [External-Database-URL] -f backend/database/add_system_settings.sql
```

Or use Render's web shell:
1. Click "Connect" → "External Connection"
2. Use the provided psql command
3. Once connected, copy/paste SQL from schema files

### Step 4: Prepare Backend for Upload

Create a zip file of your backend:

**Windows:**
```powershell
cd backend
Compress-Archive -Path * -DestinationPath ../backend-deploy.zip
```

**Mac/Linux:**
```bash
cd backend
zip -r ../backend-deploy.zip . -x "node_modules/*" -x ".env"
```

### Step 5: Deploy Backend on Render

1. Click "New +" → "Web Service"
2. Choose "Deploy an existing image from a registry" → Skip
3. Actually, Render requires Git. Let's use alternative...

---

## Option 3: Heroku (Credit Card Required but Free Tier)

### Step 1: Install Heroku CLI

```bash
npm install -g heroku
```

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
cd backend
heroku create fenix-backend
```

### Step 4: Add PostgreSQL

```bash
heroku addons:create heroku-postgresql:essential-0
```

### Step 5: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=fenix_super_secret_key_2024
heroku config:set JWT_EXPIRES_IN=24h
```

### Step 6: Deploy

```bash
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a fenix-backend
git push heroku main
```

### Step 7: Initialize Database

```bash
heroku pg:psql < database/schema.sql
heroku pg:psql < database/add_system_settings.sql
```

---

## Option 4: DigitalOcean App Platform (Easiest Web UI)

### Step 1: Create Account

Go to https://www.digitalocean.com/products/app-platform

### Step 2: Deploy Database

1. Click "Create" → "Databases"
2. Choose PostgreSQL
3. Select $15/month plan (has free trial)
4. Create database

### Step 3: Upload Backend via Zip

Unfortunately, DigitalOcean also requires Git repository.

---

## ✅ BEST OPTION WITHOUT GITHUB: Railway CLI

Here's the complete workflow:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Add PostgreSQL
railway add --database postgres

# 5. Deploy backend
cd backend
railway up

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_key
railway variables set JWT_EXPIRES_IN=24h

# 7. Initialize database
railway run psql < database/schema.sql
railway run psql < database/add_system_settings.sql

# 8. Generate domain
railway domain --generate

# 9. Get your backend URL
railway domain
```

---

## Alternative: Use Vercel for Backend (No GitHub)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy Backend

```bash
cd backend
vercel
```

Follow the prompts. Vercel will deploy your backend.

**Note**: Vercel is better for frontend. For backend, Railway CLI is recommended.

---

## For Frontend (Netlify - No GitHub)

### Option A: Netlify CLI

```bash
# Install
npm install -g netlify-cli

# Login
netlify login

# Build frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option B: Netlify Drop (Drag & Drop)

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Go to https://app.netlify.com/drop

3. Drag the `frontend/dist` folder to the drop zone

4. Done! You'll get a URL instantly.

5. To set environment variables:
   - Click on your site
   - Site settings → Environment variables
   - Add `VITE_API_URL` with your Railway backend URL

---

## 🎯 Recommended Workflow (No GitHub)

1. **Database**: Railway CLI → `railway add --database postgres`
2. **Backend**: Railway CLI → `railway up`
3. **Frontend**: Netlify Drop → Drag `dist` folder

**Total Time**: 20 minutes

---

## 📋 Quick Commands Reference

```bash
# Railway
npm install -g @railway/cli
railway login
railway init
railway add --database postgres
cd backend && railway up
railway domain --generate
railway variables set KEY=value

# Netlify
npm install -g netlify-cli
netlify login
cd frontend && npm run build
netlify deploy --prod --dir=dist
```

---

## 🆘 Troubleshooting

### Railway CLI not found
```bash
# Windows
npm config set prefix %APPDATA%\npm
# Then reinstall: npm install -g @railway/cli

# Mac/Linux
sudo npm install -g @railway/cli
```

### Database initialization fails
Use Railway web dashboard:
1. Go to railway.app
2. Click on PostgreSQL service
3. Click "Data" tab
4. Click "Query"
5. Copy/paste SQL manually

### Can't connect to database
```bash
# Get connection string
railway variables

# Test connection
railway run psql
```

---

## 💡 Pro Tip

If you want the easiest deployment without any CLI:

1. **Backend + Database**: Use Railway web UI (create project, add PostgreSQL, connect via web query editor)
2. **Frontend**: Use Netlify Drop (drag & drop `dist` folder)

This requires ZERO command line tools!
