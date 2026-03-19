# Fenix Platform

Private investment account management platform with automated progression and payout generation.

## Overview

Fenix Platform is a closed-access system for managing user investment accounts with a unique progression algorithm. Users purchase accounts that advance through levels as more accounts are created, eventually generating payouts.

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (port 5433)

### Setup

```bash
# 1. Create database
psql -U postgres -p 5433 -c "CREATE DATABASE fenix_platform;"
psql -U postgres -p 5433 -d fenix_platform -f backend/database/schema.sql

# 2. Configure backend
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL password
npm install

# 3. Configure frontend
cd ../frontend
npm install

# 4. Start servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Access
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Default admin: `admin@fenix.com` / `admin123`

## Key Features

- Role-based access (Admin/User)
- Account progression algorithm (Level 1 → 2 → 3)
- Automated payout generation
- Payment request workflow
- Password management
- Transaction-safe operations

## Tech Stack

- Backend: Node.js + Express + TypeScript + PostgreSQL
- Frontend: React + TypeScript + Vite
- Auth: JWT + bcrypt

## Documentation

- `SETUP.md` - Detailed setup instructions
- `MILESTONES.md` - Project milestones and deliverables
- `backend/database/schema.sql` - Database schema

## Project Structure

```
fenix-platform/
├── backend/          # Node.js API
│   ├── src/
│   ├── database/
│   └── .env
├── frontend/         # React app
│   └── src/
└── docs/
```

## License

Private project - All rights reserved
