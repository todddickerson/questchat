# Complete Whop Dev Proxy Setup Guide

## Prerequisites
✅ Your proxy is already running at `http://localhost:3002` (confirmed from your output)
✅ Your app is running on upstream port `3001`

## Step 1: Create/Configure Your App in Whop Dashboard

### 1.1 Access Developer Dashboard
1. Go to https://whop.com/apps
2. Click "Create App" or select your existing QuestChat app
3. Navigate to **Developer Settings**

### 1.2 Configure Base URL for Local Development
In your app settings, you need to configure:
- **Base URL**: `http://localhost:3002` (your proxy port)
- **App Path**: `/` (or your specific path structure)

### 1.3 Add App Views
Go to Integration tab: `https://whop.com/apps/biz_[YOUR_BIZ_ID]/app_[YOUR_APP_ID]/integration/`

Add these views:
1. **Consumer Product View** → Path: `/experiences/[experienceId]`
2. **Seller Product View** → Path: `/experiences/[experienceId]/admin`
3. **Discovery View** → Path: `/`

## Step 2: Set Up Environment Variables

Create/update `.env.local` with your app credentials from the dashboard:
```env
# From Whop Dashboard > Your App > API Keys
WHOP_API_KEY=whop_api_...
WHOP_APP_ID=app_...
WHOP_COMPANY_ID=comp_...
WHOP_AGENT_USER_ID=user_...

# For local development
WHOP_PUBLIC_BASE_URL=http://localhost:3002
```

## Step 3: Configure Your App for iFrame Integration

### 3.1 Update WhopClient Component
Ensure your WhopClient wrapper is properly configured:

```typescript
// app/experiences/[experienceId]/client-wrapper.tsx
'use client';

import { createAppIframeSDK } from '@whop-apps/iframe';
import { useEffect } from 'react';

export default function ClientWrapper({ children }) {
  useEffect(() => {
    // Initialize Whop SDK
    const sdk = createAppIframeSDK();
    
    // Listen for Whop messages
    sdk.on('user_token', (token) => {
      // Store token for authentication
      console.log('Received user token from Whop');
    });
    
    // Signal app is ready
    sdk.ready();
  }, []);

  return <>{children}</>;
}
```

### 3.2 Configure Headers for iFrame
Your app needs proper headers to work in Whop's iframe:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // For development only
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.whop.com http://localhost:*",
          },
        ],
      },
    ];
  },
};
```

## Step 4: Test Your App in Whop

### 4.1 Start Your Development Server
You're already running:
```bash
pnpm whop-dev
# Proxy: http://localhost:3002
# App: http://localhost:3001
```

### 4.2 Access Your App Through Whop
1. Go to your Whop dashboard: https://whop.com/hub
2. Navigate to your installed apps
3. Look for **Dev Toggle** in the top right corner
4. **Enable Dev Mode** - this tells Whop to use your local proxy URL
5. Click on your QuestChat app

### 4.3 Verify the Integration
When accessed through Whop in dev mode:
- The app should load in an iframe
- You should see authentication working (check console for user token)
- The URL in Whop should be something like: `https://whop.com/hub/app/app_[YOUR_APP_ID]`

## Step 5: Debug Common Issues

### Issue: App not loading in iframe
```bash
# Check if proxy is forwarding correctly
curl http://localhost:3002/api/health

# Should see your app's response
```

### Issue: Authentication not working
```javascript
// Add debug logging to your page
useEffect(() => {
  console.log('Headers:', headers());
  console.log('Looking for x-whop-user-token');
}, []);
```

### Issue: CORS/CSP errors
Check browser console for errors. Update your headers in `next.config.js`:
```javascript
headers: [
  {
    key: 'Access-Control-Allow-Origin',
    value: 'https://whop.com',
  },
]
```

## Step 6: Testing Different Views

### Test Experience View (Leaderboard)
1. In Whop, navigate to a specific experience
2. URL should be: `/experiences/[experienceId]`
3. Verify leaderboard loads

### Test Admin View
1. Access admin panel: `/experiences/[experienceId]/admin`
2. Should see configuration options
3. Test saving settings

### Test Discovery View
1. Access main page: `/`
2. Should see app overview

## Quick Checklist

- [ ] App created in Whop dashboard
- [ ] Base URL set to `http://localhost:3002`
- [ ] Views configured (consumer, seller, discovery)
- [ ] Environment variables set in `.env.local`
- [ ] Proxy running: `pnpm whop-dev`
- [ ] Dev mode enabled in Whop dashboard
- [ ] App loads in Whop iframe
- [ ] Authentication token received
- [ ] All views accessible

## Troubleshooting Commands

```bash
# Test your proxy is working
curl http://localhost:3002/api/health

# Check if app is responding on upstream
curl http://localhost:3001/api/health

# View proxy logs (already visible in your terminal)

# Test with specific headers
curl http://localhost:3002/experiences/test \
  -H "x-whop-user-token: test-token"
```

## Important Notes

1. **Dev Toggle**: The dev toggle in Whop dashboard is CRITICAL - without it, Whop won't know to use your local proxy
2. **Port Configuration**: Your setup uses port 3002 for proxy, 3001 for app (different from default)
3. **Authentication**: The proxy automatically fetches and forwards user tokens
4. **Hot Reload**: Changes to your code should hot reload through the proxy

## Next Steps

Once working locally:
1. Test all CRUD operations
2. Verify streak tracking works
3. Test chat integration with a real experience ID
4. Test reward generation
5. When ready, promote to production in Whop dashboard

---

## Your Current Status

✅ Proxy is running at `http://localhost:3002`
✅ App is running at `http://localhost:3001`
❓ Need to enable dev mode in Whop dashboard
❓ Need to test accessing app through Whop

**Action Required**: 
1. Go to https://whop.com/hub
2. Find the dev toggle (top right)
3. Enable dev mode
4. Navigate to your QuestChat app
5. It should now load from your local proxy!