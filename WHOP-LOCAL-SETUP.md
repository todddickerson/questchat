# QuestChat Local Whop Development Setup ✅

## Your Environment is Configured! 

### Current Status
- ✅ **Environment variables** saved in `.env.local`
- ✅ **Proxy running** on port 3002
- ✅ **App running** on port 3001
- ✅ **Database connected** (Supabase PostgreSQL)
- ✅ **Whop credentials** configured

### Your Whop App Details
- **App ID**: `app_F9H2JvGE8lfV4w`
- **Company ID**: `biz_CHKyxzlPRslE1Q`
- **Agent User**: `user_efVmoTigk4GE0`

## Action Required: Complete Setup

### 1. Restart Your Dev Server
Since you've added the `.env.local` file, you need to restart to load the environment variables:

```bash
# Stop current proxy (Ctrl+C in terminal)
# Then restart:
pnpm whop-dev
```

### 2. Configure Whop Dashboard

Go to your app settings: https://whop.com/apps/biz_CHKyxzlPRslE1Q/app_F9H2JvGE8lfV4w/integration/

**Update these settings:**
- **Base URL**: `http://localhost:3002`
- **App Path**: `/`

**Add Views:**
1. **Consumer Product** → Path: `/experiences/[experienceId]`
2. **Seller Product** → Path: `/experiences/[experienceId]/admin`  
3. **Discovery** → Path: `/`

### 3. Enable Dev Mode in Whop

**CRITICAL**: This is required for local testing!

1. Go to https://whop.com/hub
2. Look for the **dev toggle** (🔧 icon) in top right
3. **Click to enable** development mode
4. You'll see "Development Mode" indicator

### 4. Test Your App

Once dev mode is ON:
1. Navigate to your QuestChat app in Whop
2. Direct link: https://whop.com/hub/app/app_F9H2JvGE8lfV4w
3. The app should load from `localhost:3002`

### 5. Verify Everything Works

Run the verification script:
```bash
node scripts/verify-proxy.js
```

Test the health endpoint:
```bash
curl http://localhost:3002/api/health | jq .
```

## Troubleshooting

### If you see Prisma errors:
```bash
# Clear cache and regenerate
rm -rf .next node_modules/.prisma
pnpm prisma generate
pnpm whop-dev
```

### If app doesn't load in Whop:
1. **Check dev mode is ON** in Whop dashboard
2. **Verify Base URL** is `http://localhost:3002` in app settings
3. **Check browser console** for errors
4. **Ensure proxy is running** on port 3002

### Test URLs:
- Proxy health: http://localhost:3002/api/health
- Experience page: http://localhost:3002/experiences/test
- Admin page: http://localhost:3002/experiences/test/admin

## What's Working

With your current setup, you have:
- ✅ Full Whop API integration
- ✅ Database connectivity (Supabase)
- ✅ Authentication framework
- ✅ Cron job protection
- ✅ Experience management

## Next Steps

### Get a Real Chat Experience ID
1. Create a chat experience in Whop
2. Get the experience ID (format: `exp_xxxxx`)
3. Update your code to use this ID

### Test Core Features
1. **Daily Prompts**: Test posting to chat
2. **Streak Tracking**: Verify user streak increments
3. **Rewards**: Test promo code generation

### Production Deployment
When ready to deploy:
1. Update `WHOP_PUBLIC_BASE_URL` to your Vercel URL
2. Set all env vars in Vercel dashboard
3. Promote app to production in Whop

## Quick Commands Reference

```bash
# Start dev proxy
pnpm whop-dev

# Generate Prisma client
pnpm prisma generate

# View database
pnpm db:studio

# Run tests
npx playwright test

# Check integration
node scripts/test-integration.js
```

## Your App Links

- **Local Proxy**: http://localhost:3002
- **Whop Dashboard**: https://whop.com/apps/biz_CHKyxzlPRslE1Q/app_F9H2JvGE8lfV4w
- **Direct App Link**: https://whop.com/hub/app/app_F9H2JvGE8lfV4w
- **Supabase Dashboard**: https://supabase.com/dashboard/project/awzmjhbwljmvijqwtpqu

---

**Ready to test!** Enable dev mode in Whop and navigate to your app.