
# AI Legal Authentication System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Features](#security-features)
4. [User Registration](#user-registration)
5. [Sign-In Process](#sign-in-process)
6. [Admin Dashboard](#admin-dashboard)
7. [Setup Instructions](#setup-instructions)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Troubleshooting](#troubleshooting)

## Overview

The AI Legal authentication system provides secure, enterprise-grade access control for lawyers at Reichman Jorgensen LLP. The system supports self-service registration, email verification, admin monitoring, and comprehensive security features.

### Key Features
- **Domain-restricted registration** (@reichmanjorgensen.com only)
- **Email verification** with 24-hour expiry
- **Strong password requirements**
- **Account lockout protection** (5 attempts, 30-minute lockout)
- **Admin dashboard** for user monitoring
- **Comprehensive audit logging**
- **Session management** with JWT tokens
- **Guest access** for testing

## Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcrypt (12 rounds)
- **Session Storage**: JWT tokens (8-hour expiry)
- **Email Service**: Office 365 SMTP (production)

### Data Flow
```
Registration Flow:
User → Registration Form → API Validation → Database → Email Service → Verification

Sign-In Flow:
User → Sign-In Form → API Authentication → Database Check → JWT Session → Dashboard
```

## Security Features

### 1. Password Security
- **Minimum Requirements**:
  - At least 8 characters
  - One uppercase letter (A-Z)
  - One lowercase letter (a-z)
  - One number (0-9)
  - One special character (@$!%*?&)
- **Storage**: bcrypt hashed with 12 salt rounds
- **Real-time validation UI** during registration

### 2. Account Protection
- **Failed Login Tracking**: Counts failed attempts per user
- **Account Lockout**: Locks after 5 failed attempts
- **Lockout Duration**: 30 minutes
- **IP Address Logging**: Tracks login attempts by IP
- **Email Verification**: Required before first sign-in

### 3. Session Security
- **JWT Tokens**: Cryptographically signed
- **Session Duration**: 8 hours
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only in production
- **CSRF Protection**: Built into NextAuth.js

### 4. Audit Logging
All authentication events are logged:
- User registrations (success/failure)
- Login attempts (success/failure)
- Email verifications
- Password resets
- Account lockouts

### 5. Rate Limiting
- **Registration**: 5 attempts per IP per hour
- **Login**: 20 attempts per IP per minute
- **API Calls**: 100 requests per minute per IP

## User Registration

### Step-by-Step Process

1. **Navigate to Registration**
   ```
   https://your-domain.com/auth/register
   ```

2. **Fill Registration Form**
   - **Full Name**: Optional (defaults to email prefix)
   - **Email**: Must be @reichmanjorgensen.com
   - **Password**: Must meet all requirements
   - **Confirm Password**: Must match

3. **Submit Registration**
   - System validates all inputs
   - Creates unverified user account
   - Sends verification email
   - Shows success message

4. **Email Verification**
   - Check email inbox
   - Click verification link (valid 24 hours)
   - Redirected to sign-in page

5. **First Sign-In**
   - Use registered email/password
   - Account now fully active

### Registration UI Features
- Real-time password strength indicator
- Live validation feedback
- Show/hide password toggle
- Clear error messages
- Mobile-responsive design

### Example Registration Code
```typescript
// Frontend validation
const passwordRules = [
  { test: (p) => p.length >= 8, text: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), text: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), text: 'One lowercase letter' },
  { test: (p) => /\d/.test(p), text: 'One number' },
  { test: (p) => /[@$!%*?&]/.test(p), text: 'One special character' }
];
```

## Sign-In Process

### Standard Sign-In

1. **Navigate to Sign-In**
   ```
   https://your-domain.com/auth/signin
   ```

2. **Enter Credentials**
   - Email address
   - Password

3. **Authentication Flow**
   - Validates email domain
   - Checks email verification
   - Verifies password
   - Checks account lock status
   - Creates JWT session
   - Redirects to dashboard

### Guest Access
- Click "Continue Without Signing In"
- Limited functionality (no chat saving)
- Useful for demos and testing

### Sign-In Security Checks
```typescript
// Authentication process
1. Email domain validation (@reichmanjorgensen.com)
2. User exists in database
3. Email is verified
4. Account not locked
5. Password matches hash
6. Update last login timestamp
7. Reset failed attempts counter
8. Create session token
```

## Admin Dashboard

### Creating an Admin Account

#### Method 1: Command Line Script
```bash
# Install dependencies
npm install

# Run the admin creation script
npm run create-admin -- --email admin@reichmanjorgensen.com --password SecureAdminPass123!

# Optional: specify name
npm run create-admin -- --email admin@reichmanjorgensen.com --password SecureAdminPass123! --name "John Admin"
```

#### Method 2: Upgrade Existing User
```bash
# If user already exists, the script will upgrade them to admin
npm run create-admin -- --email existing@reichmanjorgensen.com --password ignored
```

#### Method 3: Direct Database Update
```sql
-- Via Prisma Studio
npx prisma studio

-- Or SQL query
UPDATE "User" SET role = 'admin' WHERE email = 'user@reichmanjorgensen.com';
```

### Accessing Admin Dashboard

1. **Sign in as Admin**
   - Use admin credentials at `/auth/signin`

2. **Navigate to Dashboard**
   ```
   https://your-domain.com/admin
   ```

3. **Dashboard Features**
   - **User Overview**: Total users, verified, locked, new this week
   - **User Table**: All registered users with details
   - **Activity Logs**: Recent authentication events
   - **Export**: Download user list as CSV

### Admin Dashboard Sections

#### Users Tab
| Column | Description |
|--------|-------------|
| Email | User's email address |
| Name | Display name |
| Status | Verified/Unverified/Locked |
| Created | Registration date |
| Last Login | Most recent sign-in |

#### Activity Logs Tab
- Real-time authentication events
- Filterable by action type
- Shows IP addresses
- Success/failure status
- Error messages for failures

#### Export Functionality
```csv
Email,Name,Verified,Created At,Last Login,Status
john@reichmanjorgensen.com,John Smith,Yes,2024-01-15,2024-01-20 14:30,Active
jane@reichmanjorgensen.com,Jane Doe,Yes,2024-01-16,Never,Active
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone [repository]
   cd lawyer-chat
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example env file
   cp .env.example .env.local
   
   # Edit .env.local with your values
   DATABASE_URL=postgresql://user:password@localhost:5432/lawyer_chat
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NEXTAUTH_URL=http://localhost:3001
   ```

3. **Setup Database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Generate Prisma client
   npm run db:generate
   ```

4. **Create Admin User**
   ```bash
   npm run create-admin -- --email admin@reichmanjorgensen.com --password YourSecurePass123!
   ```

5. **Configure Email (Production)**
   ```env
   # Office 365 SMTP settings
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=noreply@reichmanjorgensen.com
   SMTP_PASS=your-outlook-app-password
   SMTP_FROM=AI Legal <noreply@reichmanjorgensen.com>
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Environment Variables**
   ```env
   NODE_ENV=production
   NEXTAUTH_URL=https://legal.reichmanjorgensen.com
   DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/lawyer_chat
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm run start
   ```

3. **Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Create new user account
```json
Request:
{
  "email": "user@reichmanjorgensen.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "name": "John Smith"
}

Response:
{
  "message": "Registration successful! Please check your email to verify your account.",
  "email": "user@reichmanjorgensen.com"
}
```

#### GET /api/auth/verify
Verify email address
```
Query Parameters:
- token: Verification token from email
- email: User's email address

Response: Redirect to /auth/signin?verified=true
```

#### POST /api/auth/signin
Sign in with credentials (handled by NextAuth.js)

### Admin Endpoints

#### GET /api/admin/users
Get all registered users (admin only)
```json
Response:
[
  {
    "id": "clxxx...",
    "email": "user@reichmanjorgensen.com",
    "name": "John Smith",
    "emailVerified": "2024-01-15T10:30:00Z",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLoginAt": "2024-01-20T14:30:00Z",
    "failedLoginAttempts": 0,
    "lockedUntil": null
  }
]
```

#### GET /api/admin/audit-logs
Get authentication audit logs (admin only)
```json
Response:
[
  {
    "id": "clyyy...",
    "action": "LOGIN_SUCCESS",
    "email": "user@reichmanjorgensen.com",
    "ipAddress": "192.168.1.1",
    "success": true,
    "createdAt": "2024-01-20T14:30:00Z"
  }
]
```

## Database Schema

### User Model
```prisma
model User {
  id                       String    @id @default(cuid())
  email                    String?   @unique
  name                     String?
  password                 String?
  emailVerified            DateTime?
  role                     String    @default("user")
  
  // Registration tracking
  registrationToken        String?   @unique
  registrationTokenExpires DateTime?
  registrationIp           String?
  
  // Security tracking
  failedLoginAttempts      Int       @default(0)
  lockedUntil              DateTime?
  lastLoginAt              DateTime?
  lastLoginIp              String?
  
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
}
```

### AuditLog Model
```prisma
model AuditLog {
  id           String   @id @default(cuid())
  action       String   // USER_REGISTRATION, LOGIN_SUCCESS, etc.
  userId       String?
  email        String?
  ipAddress    String?
  userAgent    String?
  success      Boolean  @default(true)
  errorMessage String?
  metadata     Json?
  createdAt    DateTime @default(now())
  
  @@index([action, createdAt])
  @@index([email])
}
```

## Troubleshooting

### Common Issues

#### 1. Email Verification Not Working
**Development Mode**:
- Check console for verification URL
- Email sending is disabled in dev mode

**Production Mode**:
- Verify SMTP credentials
- Check spam folder
- Ensure firewall allows SMTP port

#### 2. Cannot Create Admin
**Error: "User already exists"**
- User is already registered
- Run script again to upgrade to admin

**Error: "Database connection failed"**
- Check DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Verify database credentials

#### 3. Login Failures
**"Account locked"**
- Wait 30 minutes or manually unlock:
  ```sql
  UPDATE "User" 
  SET "failedLoginAttempts" = 0, "lockedUntil" = NULL 
  WHERE email = 'user@reichmanjorgensen.com';
  ```

**"Please verify your email"**
- Check email for verification link
- Resend verification (feature coming soon)

#### 4. Session Issues
**"Unauthorized" errors**
- Clear browser cookies
- Sign in again
- Check NEXTAUTH_SECRET is set

### Debug Mode

Enable detailed logging:
```env
# .env.local
DEBUG=* 
NEXTAUTH_DEBUG=true
```

Check logs:
```bash
# Application logs
npm run dev

# Database queries
npx prisma studio

# View audit logs
Sign in as admin → /admin → Activity Logs
```

### Support Contacts

For technical issues:
- IT Department: it@reichmanjorgensen.com
- Developer Team: dev@reichmanjorgensen.com

For account issues:
- HR Department: hr@reichmanjorgensen.com

## Security Best Practices

1. **Password Management**
   - Use unique, strong passwords
   - Consider password manager
   - Change passwords regularly

2. **Account Security**
   - Verify email immediately
   - Report suspicious activity
   - Don't share credentials

3. **Admin Responsibilities**
   - Monitor user registrations
   - Review audit logs weekly
   - Export user data monthly
   - Remove inactive accounts

4. **Development Security**
   - Never commit .env files
   - Use different passwords for dev/prod
   - Rotate secrets regularly
   - Keep dependencies updated

---

*Last Updated: January 2024*
*Version: 1.0.0*