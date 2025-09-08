# Claude Code Handoff Guide - QuestChat

## Project Context & Mission
QuestChat is a 48-hour build kit that transforms Whop Chat communities into engagement engines through:
- **Daily Prompts**: Automated bot posts questions at scheduled times
- **Streak Tracking**: Users maintain daily participation streaks  
- **Auto-Rewards**: Promo codes automatically issued at milestone streaks (3, 7 days)

## Current Status ✅ FOUNDATION COMPLETE

### Infrastructure Ready
- ✅ Next.js 14 App Router + TypeScript + Tailwind CSS
- ✅ Prisma + SQLite with complete 8-model schema
- ✅ Whop SDK integration with auth/token verification
- ✅ Environment variables configured with live credentials
- ✅ Core library functions (whop.ts, chat.ts, rewards.ts, auth.ts, db.ts)
- ✅ Daily prompt cron endpoint (`/api/cron/prompt`)
- ✅ Project documentation and setup guides

### Database Schema (Complete)
```sql
User, Experience, Config, Streak, MessageLog, Quest, Reward, IssuedCode
```
All relationships and constraints properly defined with cascade deletes.

## CRITICAL: What You Must Build Next

### 1. ESSENTIAL API ROUTES (Priority 1 - Build These First)

#### `/app/api/cron/rollover/route.ts`
```typescript
// This is THE CORE endpoint - daily streak processing
// MUST DO:
// 1. Get messages since last prompt for each experience
// 2. Record first message per user in MessageLog (prevent double counting)
// 3. Update Streak table (current++, best = max(current, best), weekCount++)
// 4. Check thresholds (3, 7 days) and issue rewards
// 5. Create promo codes and post congrats messages
// Use: whop.messages.listMessagesFromChat() + filter by timestamp
```

#### `/app/api/cron/week/route.ts`
```typescript
// Weekly leaderboard posting
// MUST DO:
// 1. Query top users by weekCount for each experience
// 2. Format leaderboard message with rankings
// 3. Post to chat via sendChat()
// 4. Reset weekCount to 0 for all users
```

#### `/app/api/admin/test-prompt/route.ts`
```typescript
// Manual prompt trigger for testing
// Same logic as /cron/prompt but for single experience
// Include experienceId in request body
```

### 2. EXPERIENCE PAGES (Priority 2)

#### `/app/experiences/[experienceId]/page.tsx`
```typescript
// Leaderboard UI - Server Component
// MUST INCLUDE:
// - Auth check: requireAccess(experienceId)
// - Top 20 streaks query with user info
// - Current user's streak prominently displayed
// - Today's prompt status
// - Weekly leaderboard with reset countdown
// - Clean Tailwind styling matching the design system
```

#### `/app/experiences/[experienceId]/admin/page.tsx` 
```typescript
// Creator configuration panel
// MUST INCLUDE:
// - Experience config form (prompt time, grace period, reward %)
// - "Post Test Prompt Now" button
// - Quest management (add/edit/delete)
// - Live preview of current settings
// - Reward history table
// Form validation with Zod schemas
```

### 3. COMPONENTS (Priority 3)

#### `/app/components/Leaderboard.tsx`
```typescript
// Client component with real-time updates
// Use @whop/react WebSocket provider for live streak updates
// Animate confetti on milestone achievements
// Responsive design for mobile/desktop
```

## IMPLEMENTATION REQUIREMENTS

### Authentication Pattern (CRITICAL)
```typescript
// Every experience page MUST start with:
import { requireAccess } from "@/src/lib/auth";

export default async function Page({ params }: { params: { experienceId: string } }) {
  const { userId } = await requireAccess(params.experienceId);
  // ... rest of component
}
```

### Database Operations
```typescript
// Always use transactions for streak updates:
await prisma.$transaction([
  // Update streak
  // Create message log  
  // Create reward if threshold met
]);
```

### Message Processing Logic
```typescript
// In rollover endpoint:
// 1. Get prompt timestamp from MessageLog where userId="SYSTEM"
// 2. List messages since that timestamp
// 3. Group by userId, take first message only
// 4. Upsert MessageLog with unique constraint (experienceId, userId, dayKey)
// 5. If new message, increment streak
```

### Reward Creation Flow
```typescript
// When streak hits threshold (3, 7 days):
// 1. Check if reward already exists (prevent duplicates)
// 2. Create promo code via whop.promoCodes.createPromoCode()
// 3. Store in IssuedCode table
// 4. Create Reward record linking to user/experience
// 5. Post congrats message to chat with code
```

## TESTING CHECKLIST

### Manual Testing Flow
1. ✅ Install deps: `pnpm install`
2. ✅ DB setup: `pnpm db:migrate` 
3. ✅ Start dev: `pnpm dev`
4. ✅ Start proxy: `pnpm whop-proxy`
5. 🔲 Configure experience in `/admin` panel
6. 🔲 Post test prompt via admin button
7. 🔲 Reply from member account in actual Whop chat
8. 🔲 Hit `/api/cron/rollover` endpoint manually
9. 🔲 Verify streak incremented in leaderboard
10. 🔲 Test 3-day streak reward generation
11. 🔲 Verify promo code creation and chat message

### API Testing
```bash
# Test endpoints with curl:
curl -X POST http://localhost:3000/api/cron/prompt \
  -H "x-questchat-signature: questchat-secret-2024-secure-key-12345"

curl -X POST http://localhost:3000/api/cron/rollover \
  -H "x-questchat-signature: questchat-secret-2024-secure-key-12345"
```

## CRITICAL SUCCESS METRICS

### Must Work Before Shipping
- [ ] Daily prompt posts to chat at scheduled time
- [ ] User messages increment streak exactly once per day
- [ ] 3-day streak triggers promo code + congrats message
- [ ] 7-day streak triggers separate reward
- [ ] Weekly leaderboard posts and resets counters
- [ ] Admin panel saves configuration correctly
- [ ] Access control blocks non-members

## CODE STYLE & STANDARDS

### File Organization
- Use server components by default
- Client components only for interactivity (forms, real-time updates)
- Keep API routes focused on single responsibility
- Use consistent error handling patterns

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error("Context-specific error message:", error);
  return NextResponse.json({ error: "User-friendly message" }, { status: 500 });
}
```

### TypeScript
- Use strict mode
- Define interfaces for API responses
- Leverage Prisma generated types
- Add JSDoc comments for complex functions

## WHOP API REFERENCE

### Key Endpoints You'll Use
```typescript
// Send message to chat
whop.messages.sendMessageToChat({ experienceId, message })

// List messages from chat  
whop.messages.listMessagesFromChat({ chatExperienceId })

// Create promo code
whop.promoCodes.createPromoCode({
  accessPassId, promoType: "percentage", amountOff: 20,
  code, stock: 1, expirationDatetime, onePerCustomer: true
})

// Check user access
whop.access.checkIfUserHasAccessToExperience({ userId, experienceId })
```

## ENVIRONMENT VARIABLES STATUS

### ✅ Already Configured (No Action Needed)
```bash
WHOP_API_KEY=IoxDyQvZ0S1yP55sWgvfPOBur4LyveCumAbod0JyPZQ
WHOP_AGENT_USER_ID=user_efVmoTigk4GE0  
WHOP_APP_ID=app_F9H2JvGE8lfV4w
WHOP_COMPANY_ID=biz_CHKyxzlPRslE1Q
WHOP_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
QUESTCHAT_SIGNING_SECRET=questchat-secret-2024-secure-key-12345
```

## DEPLOYMENT CONSIDERATIONS

### Database Migration
- Current: SQLite (perfect for MVP)
- Production: Easy upgrade to PostgreSQL
- Migration command: `pnpm db:push` for schema changes

### Cron Job Setup
Deploy these scheduled endpoints:
- `/api/cron/prompt` - Daily at creator's chosen time
- `/api/cron/rollover` - Daily at 00:05 UTC  
- `/api/cron/week` - Mondays at 09:00 UTC

All require header: `x-questchat-signature: [secret]`

## SUCCESS DEFINITION

The project is complete when:
1. A creator can configure prompts and rewards via admin panel
2. Bot posts daily prompts automatically  
3. Members reply and streaks increment correctly
4. Rewards auto-generate at 3/7-day milestones
5. Weekly leaderboards post and reset
6. All access control works properly
7. The app runs stably in production

## START HERE

Your immediate next steps:
1. `cd /Users/todddickerson/src/questchat`
2. `pnpm install`
3. `pnpm db:migrate`
4. Build `/api/cron/rollover/route.ts` first (most critical)
5. Build experience pages for UI
6. Test end-to-end flow

The foundation is rock-solid. Focus on the rollover logic and experience pages - those are the core value propositions. Everything else is polish.

🚀 **You've got this! The hardest parts (auth, database, Whop integration) are done.**
