# Setup Guide

## Prerequisites
- Node.js 20+
- PNPM package manager
- SQLite (included with Node.js)

## 1. Create your Whop App & Get Credentials

1. Go to [Whop Dashboard](https://dash.whop.com) → Developer → Create App
2. Copy the following credentials:
   - **API Key** → `WHOP_API_KEY`
   - **Agent User ID** → `WHOP_AGENT_USER_ID` (lets the bot post)
   - **App ID** → `WHOP_APP_ID`
   - **Company ID** → `WHOP_COMPANY_ID`

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Fill in your Whop credentials in the `.env` file.

## 4. Initialize Database

```bash
pnpm db:migrate
```

This creates the SQLite database and runs the initial migration.

## 5. Local Development Inside Whop

**Terminal 1 - Start the dev server:**
```bash
pnpm dev
```

**Terminal 2 - Start Whop proxy:**
```bash
pnpm whop-proxy
```

This opens a local preview inside Whop's interface.

## 6. Configure Your Chat Experience

1. In your Whop app dashboard, toggle to "Dev" → "Local"
2. Open the experience tab in your Whop
3. Navigate to `/experiences/[experienceId]/admin`
4. Paste your Chat experience ID (exp_...)
5. Configure prompt timing and rewards

## 7. Set Up Cron Jobs (Production)

Configure these endpoints to run on schedule:

- **Daily Prompt**: `POST /api/cron/prompt` at your chosen time
- **Nightly Rollover**: `POST /api/cron/rollover` at 00:05 UTC
- **Weekly Leaderboard**: `POST /api/cron/week` on Mondays at 09:00 UTC

Include the header: `x-questchat-signature: [your-secret]`

## 8. Test the System

1. Click "Post test prompt now" in the Admin panel
2. Reply to the prompt from a member account in the chat
3. Manually run `/api/cron/rollover` to advance streaks
4. Check that rewards are issued at 3/7-day milestones

## Troubleshooting

- **Bot not posting**: Check Agent User ID and API key
- **Access denied**: Verify experience ID and user permissions
- **Database errors**: Ensure migrations ran successfully with `pnpm db:migrate`
- **Reward codes not working**: Check promo code configuration and stock levels

## Next Steps

- Deploy to Vercel/Railway/Fly
- Switch to PostgreSQL for production scale
- Set up monitoring and logging
- Configure real-time updates with websockets
