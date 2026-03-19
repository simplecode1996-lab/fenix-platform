# Fenix Platform - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (installed on port 5433)
- npm or yarn

## Step-by-Step Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Create PostgreSQL Database

Open your PostgreSQL client (pgAdmin or command line):

```bash
# Connect to PostgreSQL
psql -U postgres -p 5433

# Create database
CREATE DATABASE fenix_platform;

# Verify
\l

# Exit
\q
```

### 3. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` file with your settings:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5433
DB_NAME=fenix_platform
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=change_this_to_random_string_in_production
JWT_EXPIRES_IN=24h
```

### 4. Run Database Migration

```bash
# Windows (PowerShell)
Get-Content database/schema.sql | psql -U postgres -p 5433 -d fenix_platform

# Or using psql directly
psql -U postgres -p 5433 -d fenix_platform -f database/schema.sql
```

This will create:
- 4 tables (users, user_accounts, payments_to_users, fenix_wallets)
- Indexes for performance
- Default admin user
- Sample wallet addresses

### 5. Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Server running on port 3000
✓ Environment: development
✓ Database connected successfully
```

### 6. Test the API

Open a new terminal and test the login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@fenix.com\",\"password\":\"admin123\"}"
```

You should receive a JWT token in the response.

## Default Credentials

**Email:** admin@fenix.com  
**Password:** admin123

⚠️ **IMPORTANT:** Change this password immediately in production!

## Troubleshooting

### Database Connection Error

If you see "database connection error":
1. Verify PostgreSQL is running on port 5433
2. Check your `.env` file has correct credentials
3. Ensure database `fenix_platform` exists

### Port Already in Use

If port 3000 is busy, change `PORT` in `.env` file.

### Module Not Found

Run `npm install` again to ensure all dependencies are installed.

## Next Steps

Once setup is complete, you can:
1. Test authentication endpoints
2. Verify database tables were created
3. Proceed to Milestone 2 development

## Milestone 1 Deliverables ✓

- [x] Database schema with 4 tables
- [x] Backend project structure
- [x] JWT authentication system
- [x] API base configuration
- [x] Environment configuration
- [x] Setup documentation
