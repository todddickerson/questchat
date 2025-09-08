# Whop Authentication Architecture

## Overview
QuestChat uses Whop's iframe authentication system to verify users and manage access. The app works both in Whop iframe context and standalone.

## Authentication Flow

### 1. Iframe Context (Primary Use Case)
When QuestChat loads inside Whop's iframe:
- Whop automatically injects `x-whop-user-token` header
- The dev proxy handles this in development
- Production receives tokens directly from Whop

### 2. Token Verification
```typescript
// src/lib/whop.ts
export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.WHOP_APP_ID,
  dontThrow: false,
});

export async function getUserFromHeaders(headers: Headers) {
  const token = headers.get("x-whop-user-token");
  if (!token) throw new Error("No user token provided");
  
  const { userId } = await verifyUserToken(token);
  return { userId };
}
```

### 3. Page-Level Authentication
```typescript
// app/experiences/[experienceId]/page.tsx
// Flexible auth - works with or without token
let userId: string | null = null;

try {
  const hdrs = await headers();
  const token = hdrs.get("x-whop-user-token");
  
  if (token) {
    const tokenData = await verifyUserToken(token);
    userId = tokenData.userId;
    // Load user-specific data like personal streak
  }
} catch (authError) {
  // Auth is optional for viewing leaderboard
  console.log("Auth token not available:", authError);
}
```

## Development Setup

### Using Whop Dev Proxy
The proxy automatically handles authentication headers:

```bash
# Start with proxy (recommended)
pnpm whop-proxy

# Or custom ports
pnpm dlx @whop-apps/dev-proxy --proxyPort 3000 --upstreamPort 3001 --command 'next dev --port 3001'
```

### Testing in Whop Dashboard
1. Install app in your Whop
2. Click gear icon → Select "localhost"
3. App loads from `http://localhost:3000` with auth headers

## API Route Protection

### Cron Jobs (Server-to-Server)
```typescript
// Use signing secret for cron endpoints
const signature = headers.get("x-questchat-signature");
if (!validateSignature(signature, process.env.QUESTCHAT_SIGNING_SECRET)) {
  return new Response("Unauthorized", { status: 401 });
}
```

### User Actions (Client-to-Server)
```typescript
// Use Whop token for user actions
const { userId } = await getUserFromHeaders(await headers());
const hasAccess = await checkUserAccess(userId, experienceId);
```

## Access Control Patterns

### Public Pages (View-Only)
- Leaderboard viewing - No auth required
- Show personalized data if authenticated

### Protected Actions
- Admin panel - Requires creator/admin role
- Message processing - Requires membership
- Reward claiming - Requires verified streak

## Environment Variables

### Required for Auth
```env
WHOP_API_KEY=         # Server-side API key
WHOP_APP_ID=          # App identifier (app_xxx)
WHOP_AGENT_USER_ID=   # Service account for server actions
```

### Token Flow
1. User visits Whop → Clicks app
2. Whop iframe loads with token header
3. App verifies token with Whop SDK
4. User identity confirmed
5. Personalized content served

## Error Handling

### Missing Token
- Show public view (leaderboard)
- Hide personal stats
- Disable admin features

### Invalid Token
- Log error for debugging
- Fallback to public view
- Don't expose error to user

### Network Issues
- Cache token validation briefly
- Retry with exponential backoff
- Graceful degradation

## Security Considerations

1. **Never trust client tokens** - Always verify server-side
2. **Use HTTPS in production** - Tokens are sensitive
3. **Validate experience access** - Users need active membership
4. **Rate limit API calls** - Prevent token abuse
5. **Log auth attempts** - Monitor for attacks

## Testing Authentication

### Without Whop (Direct Access)
```bash
# Page loads but no user-specific data
curl http://localhost:3000/experiences/exp_xxx
```

### With Mock Token (Dev Only)
```bash
# Add token header for testing
curl -H "x-whop-user-token: mock_token" http://localhost:3000/experiences/exp_xxx
```

### Full Integration Test
1. Start proxy: `pnpm whop-proxy`
2. Open Whop dashboard
3. Navigate to installed app
4. Enable localhost mode
5. Verify user data loads

## Common Issues

### "No user token provided"
- Not running through proxy in dev
- Not in iframe in production
- Direct URL access (expected)

### "Invalid user token"
- Token expired (rare)
- Wrong app ID configured
- Network issues with Whop API

### "Access denied"
- User not member of experience
- Membership expired
- Experience doesn't exist

## Best Practices

1. **Graceful degradation** - App works without auth
2. **Fast public content** - Don't block on auth
3. **Progressive enhancement** - Add features for authenticated users
4. **Clear error messages** - Help users understand access issues
5. **Secure by default** - Protect sensitive operations