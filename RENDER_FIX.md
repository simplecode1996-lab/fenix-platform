# Render Configuration Fix

## Problem
Backend returns 404 for all routes - server is running but routes not found.

## Root Cause
Render is likely not running from the correct directory or the build isn't working.

## Solution - Update Render Settings

### Step 1: Go to Render Dashboard
https://dashboard.render.com → Select `fenix-backend-g6pv`

### Step 2: Go to Settings Tab

### Step 3: Update Build & Deploy Settings

**Option A - Set Root Directory (RECOMMENDED):**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Option B - Use cd commands:**
- Root Directory: (leave empty)
- Build Command: `cd backend && npm install && npm run build`
- Start Command: `cd backend && npm start`

### Step 4: Environment Variables
Go to Environment tab and ensure these are set:

```
DATABASE_URL=postgresql://postgres:fenix123%23%40%21%40@db.bhtosjlllltsimoyabis.supabase.co:5432/postgres
JWT_SECRET=fenix-super-secret-key-2024
NODE_ENV=production
```

### Step 5: Manual Deploy
After changing settings:
- Click "Manual Deploy" → "Deploy latest commit"
- Wait 2-3 minutes for build to complete

### Step 6: Check Logs
After deploy completes:
- Go to "Logs" tab
- Look for:
  ```
  ✓ Database connected successfully
  ✓ Server running on port 10000
  ✓ Environment: production
  ```

## Verification

### Test 1: Health Check
```bash
curl https://fenix-backend-g6pv.onrender.com/health
```
Expected: `{"status":"ok","message":"Fenix Platform API is running"}`

### Test 2: Login
```bash
curl -X POST https://fenix-backend-g6pv.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fenix.com","password":"admin123"}'
```
Expected: JSON with token

## If Still Not Working

### Check Build Logs
Look for these in the build logs:
- ✓ TypeScript compilation successful
- ✓ dist/server.js created
- ✓ No TypeScript errors

### Check Runtime Logs
Look for these in runtime logs:
- ✓ Server starting
- ✓ Database connection
- ✓ Port listening

### Common Issues

**Issue: "Cannot find module"**
- Solution: Make sure `npm install` includes devDependencies during build
- Build command: `npm install --include=dev && npm run build`

**Issue: "ECONNREFUSED localhost:5433"**
- Solution: DATABASE_URL not set correctly
- Check Environment tab for DATABASE_URL

**Issue: "Route not found" for all routes**
- Solution: Server not running from correct directory
- Set Root Directory to `backend` in Settings

**Issue: TypeScript errors during build**
- Solution: Install @types packages
- Already fixed in package.json

## Alternative: Use render.yaml

Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: fenix-backend
    env: node
    region: oregon
    plan: free
    rootDir: backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: fenix-super-secret-key-2024
      - key: DATABASE_URL
        sync: false
```

Then commit and push - Render will auto-detect the config.
