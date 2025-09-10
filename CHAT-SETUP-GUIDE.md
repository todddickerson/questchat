# QuestChat - Whop Chat Integration Setup Guide

## Current Status
- **Experience ID**: `exp_ms5KOPv48rZVnh` 
- **Status**: Not configured as a chat channel
- **Issue**: Experience exists but doesn't have chat functionality enabled

## Steps to Enable Chat

### Option 1: Add Chat App to Your Whop
1. **Go to your Whop Dashboard**
   - Navigate to https://whop.com/dashboard
   
2. **Add the Chat App**
   - Click on "Chat" section
   - Click "Add App" to install the Chat app
   - This creates chat channels within your Whop

3. **Configure Chat Channel**
   - Create a new chat channel specifically for QuestChat
   - Name it something like "QuestChat Community" or "Daily Prompts"
   - Note the new chat channel's experience ID

4. **Update QuestChat Configuration**
   - Use the new chat channel's experience ID in QuestChat
   - Update environment variables if needed

### Option 2: Use External Chat Integration
If you already have a Discord or other chat platform:
1. Use Whop's Discord integration
2. Connect your Discord server through Whop's integrations
3. Use webhook URLs for message posting

## Testing Your Setup

After enabling chat, test using the admin panel at:
```
http://localhost:3001/experiences/exp_ms5KOPv48rZVnh/admin
```

1. Click "🔄 Refresh Status" to check if chat is detected
2. Click "🧪 Test Chat" to verify message sending
3. Click "📮 Post Test Prompt Now" to send a test message

## Environment Variables Required

```env
# Whop API Configuration
WHOP_API_KEY=your_api_key_here
WHOP_AGENT_USER_ID=user_id_for_bot_messages
WHOP_APP_ID=app_XXXXXXXXXXXXX
WHOP_COMPANY_ID=biz_CHKyxzlPRslE1Q

# Optional: If using a different chat channel than the main experience
WHOP_CHAT_EXPERIENCE_ID=exp_XXXXXXXXXXXXX
```

## Troubleshooting

### "Not a chat feed" Error
This means the experience ID you're using doesn't have chat enabled. You need to:
- Either enable chat for the existing experience in Whop dashboard
- Or create a new chat channel and use its ID

### "Cannot send messages" Error
Check that:
- `WHOP_AGENT_USER_ID` is correctly set to a valid user ID that can post as a bot
- Your API key has the necessary permissions
- The chat channel exists and is active

### Testing Without Whop Integration
For development/testing without a real chat:
- The app will fall back to "Demo mode" 
- Messages will be simulated locally
- Streaks and leaderboards will still work with test data

## API Endpoints for Testing

```bash
# Check chat status
curl http://localhost:3001/api/admin/find-chat

# Test message posting
curl -X POST http://localhost:3001/api/admin/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"experienceId": "exp_ms5KOPv48rZVnh"}'

# Get setup instructions
curl -X POST http://localhost:3001/api/admin/setup-chat \
  -H "Content-Type: application/json" \
  -d '{"action": "instructions"}'
```

## Next Steps

1. **Enable Chat**: Follow Option 1 or 2 above to enable chat functionality
2. **Configure Bot User**: Ensure WHOP_AGENT_USER_ID is set to a user that can post as a bot
3. **Test Integration**: Use the admin panel to verify everything works
4. **Set Schedule**: Configure daily prompt times in the admin panel
5. **Add Custom Prompts**: Create engaging daily questions for your community

## Resources

- [Whop Developer Docs](https://dev.whop.com)
- [Whop Chat App Documentation](https://whop.com/apps)
- [QuestChat Admin Panel](http://localhost:3001/experiences/exp_ms5KOPv48rZVnh/admin)