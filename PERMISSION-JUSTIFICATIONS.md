# QuestChat Permission Justifications

## Essential Permissions Required

### 1. **chat:manage_webhook** ✅ REQUIRED
**Justification**: QuestChat needs to create and manage webhooks to receive real-time notifications when users post messages in chat. This enables the app to track daily participation for streak counting and trigger reward distribution when milestones are reached.

### 2. **chat:moderate** ✅ REQUIRED  
**Justification**: QuestChat posts daily prompts to the chat as a bot/moderator. This permission allows the app to send automated daily quest messages and engagement prompts that drive community participation.

### 3. **experience:attach** ✅ REQUIRED
**Justification**: QuestChat needs to attach itself to chat experiences to integrate the gamification layer. This allows the app to connect its streak tracking and reward systems to specific chat channels.

### 4. **experience:create** ✅ REQUIRED
**Justification**: QuestChat may need to create dedicated quest/challenge experiences or initialize chat-enabled experiences for communities that don't have them yet. This ensures smooth onboarding.

### 5. **experience:update** ✅ REQUIRED
**Justification**: QuestChat needs to update experience configurations to save admin settings like prompt times, reward thresholds, and custom quest parameters that admins configure through the admin panel.

### 6. **experience:detach** ⚠️ OPTIONAL
**Justification**: Allows clean uninstallation - QuestChat can properly detach from experiences when being removed, ensuring no orphaned data or broken references remain.

### 7. **member:basic:read** ✅ REQUIRED
**Justification**: QuestChat needs to identify which members are participating in daily quests to track individual streaks, display usernames on leaderboards, and determine reward eligibility.

### 8. **promo_code:create** ✅ REQUIRED (if available)
**Justification**: QuestChat's core value proposition includes automatically generating and distributing promo codes as rewards for streak milestones (3-day, 7-day streaks). This permission enables the automated reward system.

### 9. **developer:basic:read** ✅ REQUIRED
**Justification**: QuestChat needs to read its own app configuration and verify its installation status to ensure proper initialization and access control.

### 10. **access_pass:basic:read** ⚠️ OPTIONAL
**Justification**: Helps QuestChat understand which access passes (products) members have, allowing for tiered rewards or exclusive quests for premium members.

## Summary for Whop

"QuestChat gamifies community engagement by posting daily prompts, tracking participation streaks, and automatically rewarding active members. The requested permissions enable:
- Automated daily quest posting (chat:moderate)
- Real-time participation tracking (chat:manage_webhook)
- Streak leaderboards with member names (member:basic:read)
- Automatic promo code rewards (promo_code:create)
- Admin configuration management (experience:update)
- Proper app integration (experience:attach, developer:basic:read)"

## Minimal Permission Set
If you want to start with the absolute minimum:
1. chat:moderate (post prompts)
2. chat:manage_webhook (track responses)
3. member:basic:read (identify participants)
4. experience:attach (connect to chat)
5. developer:basic:read (app initialization)