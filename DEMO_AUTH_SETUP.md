# Demo Authentication Setup

## Overview

Due to the PostgreSQL database not being available, I've temporarily set up a demo authentication system that allows testing without a database connection.

## Demo Account Credentials

```
Email: demo@reichmanjorgensen.com
Password: demo123
```

## What Changed

1. **Temporary Authentication Route**: The system now uses an in-memory user store instead of database queries
2. **Demo User**: A single demo user is hardcoded for testing purposes
3. **Original Route Preserved**: The database-based authentication is saved as `route-with-db.ts`

## How to Switch Back to Database Authentication

When PostgreSQL is available:

```bash
cd src/app/api/auth/[...nextauth]/
mv route.ts route-demo.ts
mv route-with-db.ts route.ts
```

## Setting Up PostgreSQL

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   brew services start postgresql
   ```

2. **Create Database**:
   ```bash
   createdb lawyerchat
   ```

3. **Update DATABASE_URL** in `.env.local`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/lawyerchat
   ```

4. **Run Migrations**:
   ```bash
   npx prisma db push
   ```

5. **Create Real Users**:
   ```bash
   node scripts/create-user.js
   ```

## Current Status

✅ **Working**:
- Authentication system structure
- Email domain validation (@reichmanjorgensen.com)
- Password hashing with bcrypt
- JWT session management
- Demo account for testing

❌ **Not Working** (requires database):
- Creating new users
- Persistent user storage
- Chat history saving
- Real employee accounts

## Next Steps

1. Set up PostgreSQL database
2. Switch back to database-based authentication
3. Create real Reichman Jorgensen employee accounts
4. Remove demo authentication code

## Security Note

This demo setup is **ONLY for testing purposes**. In production:
- Never use hardcoded credentials
- Always use a proper database
- Implement additional security measures (IP restrictions, MFA, etc.)

---

**Important**: This is a temporary solution. Please set up PostgreSQL and switch to the proper database-based authentication system before deploying to production.