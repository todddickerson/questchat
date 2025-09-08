# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

Your code is now live at: https://github.com/todddickerson/questchat

### Option 1: One-Click Deploy (Recommended)

1. **Go to Vercel Import Page:**
   https://vercel.com/import/git

2. **Import your repo:**
   - Click "Import Git Repository"
   - Enter: `https://github.com/todddickerson/questchat`
   - Or connect GitHub and select `questchat`

3. **Configure Environment Variables:**
   Copy and paste these into Vercel's environment variables section:

   ```
   WHOP_API_KEY=IoxDyQvZ0S1yP55sWgvfPOBur4LyveCumAbod0JyPZQ
   WHOP_AGENT_USER_ID=user_efVmoTigk4GE0
   WHOP_APP_ID=app_F9H2JvGE8lfV4w
   WHOP_COMPANY_ID=biz_CHKyxzlPRslE1Q
   WHOP_PUBLIC_BASE_URL=https://questchat.vercel.app
   QUESTCHAT_SIGNING_SECRET=questchat-secret-2024-secure-key-12345
   DATABASE_URL=file:./dev.db
   ```

   **For Production with Supabase (Optional):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://awzmjhbwljmvijqwtpqu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3em1qaGJ3bGptdmlqcXd0cHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzgxODIsImV4cCI6MjA3MjkxNDE4Mn0.keX2Wd05FMXiUq9Y8K606xWpAVrY1hu9oygcQRnGx04
   DATABASE_URL=postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.awzmjhbwljmvijqwtpqu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```

4. **Click Deploy!**

### Option 2: CLI Deploy

```bash
# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod

# Follow prompts:
# - Link to existing project? No
# - What's your project name? questchat
# - In which directory? ./
# - Override settings? No
```

### Post-Deployment

1. **Update WHOP_PUBLIC_BASE_URL:**
   After deployment, update this in Vercel dashboard to your actual URL:
   ```
   WHOP_PUBLIC_BASE_URL=https://questchat-[your-hash].vercel.app
   ```

2. **Test the deployment:**
   - Visit your Vercel URL
   - Check all environment indicators are green
   - Test cron endpoints

3. **Configure Custom Domain (Optional):**
   - Go to Settings → Domains in Vercel dashboard
   - Add your custom domain

## 🔧 Cron Jobs

Already configured in `vercel.json`:
- Daily prompt: 9:00 UTC
- Daily rollover: 00:05 UTC  
- Weekly leaderboard: Mondays 9:00 UTC

These will activate automatically after deployment.

## 📊 Monitoring

Access your deployment at:
https://vercel.com/todddickerson/questchat

View:
- Real-time logs
- Function metrics
- Error tracking
- Performance analytics

## ✅ Status

- GitHub Repo: ✅ Created and pushed
- Vercel Config: ✅ Ready (vercel.json)
- Environment Variables: ✅ Documented
- Cron Jobs: ✅ Configured
- Database: ✅ SQLite for MVP (upgrade to Supabase later)

**Ready to deploy!** Just follow Option 1 above for the easiest deployment.