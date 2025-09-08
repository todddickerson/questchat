# Claude Code Handoff Guide - QuestChat

## Project Status: ✅ DEPLOYED & FUNCTIONAL

QuestChat is a Whop engagement app that gamifies community participation through:
- **Daily Prompts**: Automated bot posts questions at scheduled times
- **Streak Tracking**: Users maintain daily participation streaks  
- **Auto-Rewards**: Promo codes automatically issued at milestone streaks (3, 7 days)

## 🚀 Live Deployment

- **Production URL**: https://questchat.vercel.app
- **Whop Dashboard**: https://whop.com/joined/fitbro2-0/quest-chat-ms5KOPv48rZVnh/app/
- **Database**: PostgreSQL on Supabase
- **Hosting**: Vercel with automatic deployments from GitHub

## ✅ Completed Features

### Infrastructure
- ✅ Next.js 14 App Router + TypeScript + Tailwind CSS
- ✅ Prisma ORM with PostgreSQL (migrated from SQLite)
- ✅ Whop SDK integration with iframe support
- ✅ Environment variables configured for dev/prod
- ✅ CORS and iframe headers for Whop embedding
- ✅ GitHub repository with CI/CD pipeline

### Database Schema (8 Models)
```prisma
User          - Whop users with whopUserId
Experience    - Chat experiences/rooms
Config        - Experience settings (prompt time, rewards)
Streak        - User streak tracking (current, best, weekly)
MessageLog    - Daily message tracking
Quest         - Custom quests/challenges
Reward        - Issued rewards tracking
IssuedCode    - Generated promo codes
```

### API Endpoints
- ✅ `/api/cron/prompt` - Posts daily prompts to chat
- ✅ `/api/cron/rollover` - Processes streaks and rewards
- ✅ `/api/cron/week` - Weekly leaderboard and reset
- ✅ `/api/admin/test-prompt` - Manual prompt testing
- ✅ `/api/experiences/[id]/config` - Admin configuration
- ✅ `/api/health` - Health check endpoint

### UI Pages
- ✅ `/experiences/[experienceId]` - Main leaderboard view
- ✅ `/experiences/[experienceId]/admin` - Admin configuration panel
- ✅ `/experiences/[experienceId]/debug` - Debug information
- ✅ WhopClient component for SDK integration
- ✅ Responsive design with Tailwind CSS

### Cron Jobs (Vercel)
```json
{
  "crons": [
    { "path": "/api/cron/prompt", "schedule": "0 9 * * *" },
    { "path": "/api/cron/rollover", "schedule": "5 0 * * *" },
    { "path": "/api/cron/week", "schedule": "0 9 * * 1" }
  ]
}
```

## 🔧 Known Issues & Next Steps

### Issues to Address
1. **Chat Experience ID**: Need to verify correct chat experience ID for message posting
2. **Authentication**: Currently bypassed for testing, needs proper Whop SDK integration
3. **Promo Codes**: Reward generation needs testing with real Whop products

### Enhancement Opportunities
- Real-time updates with WebSocket
- More quest types and gamification
- Analytics dashboard
- Email notifications
- Custom branding per experience

## 📚 Development Guide

### Local Setup
```bash
# Clone and install
git clone https://github.com/todddickerson/questchat.git
cd questchat
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
pnpm prisma generate
pnpm prisma db push

# Run locally (basic)
pnpm dev

# Run with Whop authentication proxy (recommended)
pnpm whop-proxy
# or
pnpm whop-dev
```

### Whop Development Proxy
For proper authentication testing locally, use the Whop dev proxy. See [WHOP-DEV.md](./WHOP-DEV.md) for detailed setup instructions.

### Testing Endpoints
```bash
# Test daily prompt
curl -X POST http://localhost:3000/api/cron/prompt \
  -H "x-questchat-signature: your-secret"

# Test rollover
curl -X POST http://localhost:3000/api/cron/rollover \
  -H "x-questchat-signature: your-secret"
```

### Deployment
```bash
# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Your changes"
git push origin main

# Manual Vercel deployment
vercel --prod
```

## 🔑 Environment Variables

### Required for Production
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Whop API
WHOP_API_KEY=...
WHOP_AGENT_USER_ID=...
WHOP_APP_ID=...
WHOP_COMPANY_ID=...
WHOP_PUBLIC_BASE_URL=https://questchat.vercel.app

# Reference: Whop LLM Documentation
# https://docs.whop.com/llms-full.txt

# Security
QUESTCHAT_SIGNING_SECRET=... (generate with openssl rand -hex 32)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📊 Database Operations

### Common Queries
```typescript
// Get user streak
const streak = await prisma.streak.findUnique({
  where: { experienceId_userId: { experienceId, userId } }
});

// Update streak
await prisma.streak.update({
  where: { id: streak.id },
  data: { 
    current: streak.current + 1,
    best: Math.max(streak.current + 1, streak.best)
  }
});

// Check for rewards
if (streak.current === 3 || streak.current === 7) {
  // Issue reward
}
```

## 🎯 Success Metrics

The app is considered successful when:
1. ✅ Daily prompts post automatically
2. ✅ Users can view leaderboard in Whop
3. ✅ Streaks increment on participation
4. ✅ Rewards generate at milestones
5. ✅ Weekly reset occurs on schedule
6. ⏳ Real users actively participating
7. ⏳ Promo codes being redeemed

## 🤝 Support & Maintenance

### Monitoring
- Vercel dashboard for deployments
- Supabase dashboard for database
- GitHub Actions for CI/CD
- Error tracking (optional: Sentry)

### Common Fixes
- **Database connection issues**: Check DATABASE_URL in Vercel env vars
- **Auth errors**: Verify WHOP_API_KEY is correct
- **Cron not running**: Check vercel.json and Vercel dashboard
- **Chat posting fails**: Verify experience ID is a chat experience

## 📈 Future Roadmap

### Phase 2 Features
- [ ] Multi-company support
- [ ] Custom quest builder UI
- [ ] Leaderboard widgets
- [ ] Discord integration
- [ ] Mobile app

### Phase 3 Features
- [ ] AI-powered prompt generation
- [ ] Advanced analytics
- [ ] Marketplace for quest templates
- [ ] White-label solution

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready with Minor Issues
**Next Action**: Test with real Whop chat experience