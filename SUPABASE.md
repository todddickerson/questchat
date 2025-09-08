# Supabase Setup Guide

## ✅ Supabase Project Configuration

Your Supabase project is already set up with these details:
- **Project URL**: `https://awzmjhbwljmvijqwtpqu.supabase.co`
- **Project ID**: `awzmjhbwljmvijqwtpqu`
- **Region**: US East 2 (Ohio)

## 🔑 Required: Database Password Setup

**IMPORTANT**: You need to get your database password from Supabase to complete the setup.

### Get Your Database Password
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `awzmjhbwljmvijqwtpqu`
3. Go to **Settings** → **Database**
4. Find **Connection string** section
5. Copy the password (or reset if needed)

### Update Environment Variables
Replace `[YOUR-PASSWORD]` with your actual password:

**For Production (Vercel/GitHub):**
```bash
DATABASE_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:YOUR-ACTUAL-PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:YOUR-ACTUAL-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

**For Local Development (keep SQLite):**
```bash
DATABASE_URL="file:./dev.db"
```

## 🗄️ Database Migration

### Production Migration (First Time)
```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Run initial migration
pnpm db:push

# Or create a migration file
pnpm db:migrate
```

### Local Development
```bash
# Use SQLite for local development
pnpm db:migrate
```

## 📊 Environment Variables Summary

### ✅ Already Configured
```bash
NEXT_PUBLIC_SUPABASE_URL=https://awzmjhbwljmvijqwtpqu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3em1qaGJ3bGptdmlqcXd0cHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzgxODIsImV4cCI6MjA3MjkxNDE4Mn0.keX2Wd05FMXiUq9Y8K606xWpAVrY1hu9oygcQRnGx04
```

### 🔑 Need Your Password
```bash
DATABASE_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

## 🚀 Vercel Deployment Setup

### Environment Variables for Vercel
In your Vercel dashboard, add these environment variables:

```bash
# Whop Configuration
WHOP_API_KEY=IoxDyQvZ0S1yP55sWgvfPOBur4LyveCumAbod0JyPZQ
WHOP_AGENT_USER_ID=user_efVmoTigk4GE0
WHOP_APP_ID=app_F9H2JvGE8lfV4w
WHOP_COMPANY_ID=biz_CHKyxzlPRslE1Q
WHOP_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://awzmjhbwljmvijqwtpqu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3em1qaGJ3bGptdmlqcXd0cHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzgxODIsImV4cCI6MjA3MjkxNDE4Mn0.keX2Wd05FMXiUq9Y8K606xWpAVrY1hu9oygcQRnGx04

# Database (Replace [YOUR-PASSWORD] with actual password)
DATABASE_URL=postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Security
QUESTCHAT_SIGNING_SECRET=super-secure-production-secret-32-chars-minimum
```

## 🧪 Testing Database Connection

```bash
# Test locally
pnpm db:generate
pnpm dev

# Check Supabase dashboard for tables after migration
```

## 🔧 Troubleshooting

### Common Issues
1. **Password not working**: Reset database password in Supabase dashboard
2. **Connection timeout**: Check if your IP is allowlisted (Supabase allows all by default)
3. **Migration fails**: Ensure DIRECT_URL is set for migrations
4. **Build fails**: Make sure all environment variables are set in Vercel

### Database Access
- **Supabase Dashboard**: Direct table management
- **Prisma Studio**: Run `pnpm db:studio` for local GUI
- **API Access**: All configured through Prisma Client

## ✅ Ready for Production

Once you've added your database password:
1. ✅ **Database configured** (PostgreSQL with connection pooling)
2. ✅ **Supabase client ready** (for future real-time features)
3. ✅ **Environment variables set** (development and production)
4. ✅ **Migrations prepared** (Prisma schema for PostgreSQL)

Your QuestChat project is now configured for production-scale database deployment! 🚀
