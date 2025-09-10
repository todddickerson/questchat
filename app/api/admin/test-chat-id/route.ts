import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// API endpoint to test a specific chat experience ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatExperienceId } = body;
    
    if (!chatExperienceId) {
      return NextResponse.json(
        { error: "chatExperienceId is required" },
        { status: 400 }
      );
    }
    
    console.log(`[test-chat-id] Testing chat experience ID: ${chatExperienceId}`);
    
    const results = {
      chatExperienceId,
      isValidChat: false,
      canListMessages: false,
      canSendMessages: false,
      messageCount: 0,
      errors: [] as string[],
    };
    
    // Test 1: Try to list messages
    try {
      console.log(`[test-chat-id] Attempting to list messages from ${chatExperienceId}...`);
      const messages = await whop.messages.listMessagesFromChat({
        chatExperienceId,
      });
      
      console.log(`[test-chat-id] ✅ Successfully listed messages! Found ${messages?.posts?.length || 0} messages`);
      results.canListMessages = true;
      results.messageCount = messages?.posts?.length || 0;
      results.isValidChat = true;
      
      // Show sample message if available
      if (messages?.posts && messages.posts.length > 0) {
        const latestMessage = messages.posts[0];
        console.log(`[test-chat-id] Latest message:`, {
          id: (latestMessage as any).id,
          content: (latestMessage as any).content?.substring(0, 100),
          createdAt: (latestMessage as any).createdAt,
        });
      }
    } catch (error: any) {
      console.log(`[test-chat-id] ❌ Cannot list messages:`, error.message);
      results.errors.push(`List messages: ${error.message}`);
      
      if (error.message?.includes('Feed::ChatFeed was not found')) {
        return NextResponse.json({
          success: false,
          error: "This is not a chat channel. Please find the Chat app experience ID in your Whop dashboard.",
          details: "The ID you provided is not a chat channel. Look for a Chat app in your Whop dashboard.",
          chatExperienceId,
        });
      }
    }
    
    // Test 2: Try to send a message (only if listing worked)
    if (results.canListMessages) {
      try {
        console.log(`[test-chat-id] Attempting to send message to ${chatExperienceId}...`);
        const testMessage = `[QuestChat Test] Testing chat ID at ${new Date().toISOString()}`;
        
        const sendResult = await whop.messages.sendMessageToChat({
          experienceId: chatExperienceId,
          message: testMessage,
        });
        
        console.log(`[test-chat-id] ✅ Successfully sent message!`, sendResult);
        results.canSendMessages = true;
      } catch (error: any) {
        console.log(`[test-chat-id] ⚠️ Cannot send messages:`, error.message);
        results.errors.push(`Send message: ${error.message}`);
        
        // Try without agent user ID
        try {
          console.log(`[test-chat-id] Trying to send without agent user ID...`);
          const sendResult = await whop.messages.sendMessageToChat({
            experienceId: chatExperienceId,
            message: `[QuestChat Test 2] Testing without agent at ${new Date().toISOString()}`,
          });
          console.log(`[test-chat-id] ✅ Can send without agent ID!`);
          results.canSendMessages = true;
          results.errors.push("Note: Sending works without agent user ID");
        } catch (error2: any) {
          console.log(`[test-chat-id] ❌ Cannot send even without agent ID:`, error2.message);
        }
      }
    }
    
    // Generate recommendation
    let recommendation = "";
    if (results.isValidChat && results.canSendMessages) {
      recommendation = "✅ Perfect! This chat ID is fully functional. Save it to your configuration.";
    } else if (results.isValidChat && !results.canSendMessages) {
      recommendation = "⚠️ Chat is readable but cannot send messages. Check WHOP_AGENT_USER_ID configuration.";
    } else {
      recommendation = "❌ This is not a valid chat channel ID.";
    }
    
    return NextResponse.json({
      success: results.isValidChat,
      ...results,
      recommendation,
      canSend: results.canSendMessages,
      instructions: results.isValidChat ? {
        nextSteps: [
          "1. Add this to your .env.local file:",
          `   WHOP_CHAT_EXPERIENCE_ID=${chatExperienceId}`,
          "2. Update your chat.ts file to use this ID",
          "3. Restart your development server",
          "4. Test posting messages to the chat"
        ]
      } : null
    });
  } catch (error: any) {
    console.error("[test-chat-id] Failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to test chat ID",
        details: error.message 
      },
      { status: 500 }
    );
  }
}