# Whop Local Development Guide

## Overview

This guide explains how to develop and test QuestChat locally with proper Whop authentication using the @whop-apps/dev-proxy tool.

## Quick Start

### 1. Install the Dev Proxy

```bash
# Install as dev dependency
pnpm add -D @whop-apps/dev-proxy

# Or run directly without installation
pnpm dlx @whop-apps/dev-proxy
```

### 2. Update package.json

Add a proxy script to your package.json:

```json
{
  "scripts": {
    "dev": "next dev",
    "whop-proxy": "whop-proxy --command 'next dev --turbo'",
    "whop-dev": "pnpm dlx @whop-apps/dev-proxy --proxyPort 3000 --upstreamPort 3001 --command 'next dev --port 3001'"
  }
}
```

### 3. Run with Proxy

```bash
# Start development with Whop proxy
pnpm whop-proxy

# Or use the custom script
pnpm whop-dev
```

## Authentication Setup

### Environment Variables

Ensure your `.env.local` has all required Whop credentials:

```env
# Whop API Configuration
WHOP_API_KEY=your_api_key_here
WHOP_APP_ID=your_app_id_here
WHOP_AGENT_USER_ID=your_agent_user_id
WHOP_COMPANY_ID=your_company_id
WHOP_PUBLIC_BASE_URL=http://localhost:3000

# Webhook Secret (for webhook testing)
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

### Token Verification

Create a token verifier in `lib/whop-auth.ts`:

```typescript
import { WhopApi, makeUserTokenVerifier } from "@whop/api";

export const whopApi = WhopApi({
  appApiKey: process.env.WHOP_API_KEY!,
  onBehalfOfUserId: process.env.WHOP_AGENT_USER_ID,
});

export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.WHOP_APP_ID!,
  dontThrow: true, // Return null instead of throwing
});
```

### Using Authentication in Components

```typescript
import { verifyUserToken } from "@/lib/whop-auth";
import { headers } from "next/headers";

export async function Page() {
  const requestHeaders = await headers();
  const userTokenData = await verifyUserToken(requestHeaders);

  if (!userTokenData) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome {userTokenData.userId}!</div>;
}
```

## Testing in Whop Dashboard

### 1. Install Your App

1. Go to your Whop dashboard
2. Navigate to Developer → Your Apps
3. Click the three dots menu on QuestChat
4. Select "Install app"
5. Install into a Whop you own

### 2. Enable Localhost Mode

When viewing your installed app:
1. Click the **gear icon** (⚙️) in the top right
2. Select **"localhost"** option
3. The app will now load from `http://localhost:3000`

### 3. Test Authentication Flow

The proxy automatically:
- Proxies iframe traffic from Whop.com to localhost
- Fetches and forwards user tokens
- Injects authentication headers
- Handles CORS issues

## Proxy Command Options

```bash
# Basic usage
pnpm dlx @whop-apps/dev-proxy

# Custom ports
pnpm dlx @whop-apps/dev-proxy --proxyPort 3000 --upstreamPort 3001

# Custom command
pnpm dlx @whop-apps/dev-proxy --command "npm run custom-dev"

# Standalone mode (run proxy separately)
pnpm dlx @whop-apps/dev-proxy --standalone --upstreamPort 3001
```

## Testing Different Scenarios

### User Authentication States

Test different user scenarios:
1. Admin user
2. Regular member
3. Non-member
4. Expired membership

### API Authentication

```typescript
// Test authenticated API calls
const userProfile = await whopApi.users.getUser(userId);
const experiences = await whopApi.experiences.listExperiences();
```

### Webhook Authentication

```typescript
import { makeWebhookValidator } from "@whop/api";

const validateWebhook = makeWebhookValidator({
  webhookSecret: process.env.WHOP_WEBHOOK_SECRET!,
});

export async function POST(request: NextRequest) {
  const webhookData = await validateWebhook(request);
  // Handle webhook event
  return new Response("OK", { status: 200 });
}
```

## Common Issues & Solutions

### Issue: Authentication headers missing
**Solution**: Ensure you're running through whop-proxy, not directly via `pnpm dev`

### Issue: Invalid tokens
**Solution**: Verify environment variables are correctly set in `.env.local`

### Issue: CORS errors
**Solution**: The proxy handles CORS automatically - ensure it's running

### Issue: Port conflicts
**Solution**: Use custom ports:
```bash
pnpm dlx @whop-apps/dev-proxy --proxyPort 8080 --upstreamPort 3001
```

### Issue: Can't see app in iframe
**Solution**: 
1. Ensure app is installed in your Whop
2. Click gear icon and select "localhost"
3. Check proxy is running on correct port

## Best Practices

1. **Always use whop-proxy for development** - Direct `pnpm dev` won't have auth headers

2. **Test with different users** - Log in/out of Whop dashboard to test various scenarios

3. **Check both server and client components** - Ensure auth works everywhere

4. **Handle token expiration** - Test long-running sessions

5. **Use environment variables** - Never hardcode API keys

6. **Test production mode locally**:
```bash
pnpm build
pnpm dlx @whop-apps/dev-proxy --command "pnpm start"
```

## Development Workflow

1. Start the proxy:
```bash
pnpm whop-proxy
```

2. Open Whop dashboard and navigate to your app

3. Click gear icon → Select "localhost"

4. Make changes to your code - hot reload works

5. Test authentication flows

6. Commit and push when ready

## Advanced Configuration

### Custom Proxy Setup

Create `scripts/dev-proxy.js`:

```javascript
const { spawn } = require('child_process');

const proxy = spawn('npx', [
  '@whop-apps/dev-proxy',
  '--proxyPort', '3000',
  '--upstreamPort', '3001',
  '--command', 'next dev --port 3001 --turbo'
], {
  stdio: 'inherit',
  shell: true
});

proxy.on('close', (code) => {
  console.log(`Proxy exited with code ${code}`);
});
```

Run with:
```bash
node scripts/dev-proxy.js
```

### Multiple Environment Support

Create different scripts for different environments:

```json
{
  "scripts": {
    "dev:local": "whop-proxy --command 'next dev'",
    "dev:staging": "WHOP_API_URL=staging whop-proxy --command 'next dev'",
    "dev:prod": "WHOP_API_URL=production whop-proxy --command 'next dev'"
  }
}
```

## Debugging Tips

1. **Enable verbose logging**:
```bash
DEBUG=* pnpm whop-proxy
```

2. **Check proxy is working**:
```bash
curl http://localhost:3000/api/health
```

3. **Verify headers are injected**:
```typescript
console.log('Headers:', Object.fromEntries(headers().entries()));
```

4. **Test token validation**:
```typescript
const token = await verifyUserToken(headers());
console.log('Token valid:', !!token);
console.log('User ID:', token?.userId);
```

## Resources

- [Whop SDK Documentation](https://docs.whop.com/sdk)
- [Local Development Guide](https://docs.whop.com/sdk/local-development)
- [@whop-apps/dev-proxy on NPM](https://www.npmjs.com/package/@whop-apps/dev-proxy)
- [Whop OAuth Guide](https://docs.whop.com/apps/features/oauth-guide)

---

**Note**: Always test your app thoroughly with the proxy before deploying to production to ensure authentication works correctly.