import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// API endpoint to test chat functionality and find working chat experiences
export async function GET(request: NextRequest) {
  try {
    console.log("[find-chat] Starting chat discovery...");
    console.log("[find-chat] Using WHOP_AGENT_USER_ID:", process.env.WHOP_AGENT_USER_ID);
    
    // Known experience IDs to test
    const knownExperienceIds = [
      'exp_ms5KOPv48rZVnh', // QuestChat experience from URL
    ];
    
    const testedExperiences = [];
    
    // Test each known experience ID
    for (const expId of knownExperienceIds) {
      console.log(`[find-chat] Testing experience ${expId} for chat capability...`);
      
      // Method 1: Try to list messages from this experience
      let messageListResult = null;
      try {
        const messages = await whop.messages.listMessagesFromChat({
          chatExperienceId: expId,
        });
        
        console.log(`[find-chat] ✅ listMessagesFromChat succeeded! Found ${messages?.posts?.length || 0} messages`);
        messageListResult = {
          success: true,
          messageCount: messages?.posts?.length || 0,
          hasMessages: (messages?.posts?.length || 0) > 0,
          sample: messages?.posts?.[0] ? {
            id: (messages.posts[0] as any).id,
            content: (messages.posts[0] as any).content?.substring(0, 50),
            createdAt: (messages.posts[0] as any).createdAt
          } : null
        };
      } catch (error: any) {
        console.log(`[find-chat] ❌ listMessagesFromChat failed:`, error.message);
        messageListResult = {
          success: false,
          error: error.message,
          errorCode: error.code,
          statusCode: error.status
        };
      }
      
      // Method 2: Try to send a test message (different API method)
      let sendMessageResult = null;
      try {
        console.log(`[find-chat] Attempting sendMessageToChat for ${expId}...`);
        const result = await whop.messages.sendMessageToChat({
          experienceId: expId,
          message: `[QuestChat Test] Testing chat at ${new Date().toISOString()}`,
        });
        console.log(`[find-chat] ✅ sendMessageToChat succeeded!`);
        sendMessageResult = {
          success: true,
          messageId: result,
          details: result
        };
      } catch (error: any) {
        console.log(`[find-chat] ❌ sendMessageToChat failed:`, error.message);
        sendMessageResult = {
          success: false,
          error: error.message,
          errorCode: error.code,
          statusCode: error.status
        };
      }
      
      // Method 3: Try without agent user ID
      let sendWithoutAgentResult = null;
      try {
        console.log(`[find-chat] Attempting send without agent ID...`);
        const result = await whop.messages.sendMessageToChat({
          experienceId: expId,
          message: `[QuestChat Test 2] Testing without agent at ${new Date().toISOString()}`,
        });
        console.log(`[find-chat] ✅ Send without agent succeeded!`);
        sendWithoutAgentResult = {
          success: true,
          messageId: result,
          details: result
        };
      } catch (error: any) {
        console.log(`[find-chat] ❌ Send without agent failed:`, error.message);
        sendWithoutAgentResult = {
          success: false,
          error: error.message
        };
      }
      
      // Method 4: Try different parameter names
      let alternativeApiResult = null;
      try {
        console.log(`[find-chat] Trying alternative parameter names...`);
        // Try with just experienceId parameter
        const result = await whop.messages.sendMessageToChat({
          experienceId: expId,
          message: `[QuestChat Test 3] Alternative params at ${new Date().toISOString()}`,
          userId: process.env.WHOP_AGENT_USER_ID, // Try userId instead
        } as any);
        console.log(`[find-chat] ✅ Alternative params succeeded!`);
        alternativeApiResult = {
          success: true,
          details: result
        };
      } catch (error: any) {
        console.log(`[find-chat] ❌ Alternative params failed:`, error.message);
        alternativeApiResult = {
          success: false,
          error: error.message
        };
      }
      
      // Determine overall status
      const chatEnabled = messageListResult?.success || 
                          sendMessageResult?.success || 
                          sendWithoutAgentResult?.success ||
                          alternativeApiResult?.success;
      
      testedExperiences.push({
        id: expId,
        name: 'QuestChat Experience',
        chatEnabled,
        tests: {
          listMessages: messageListResult,
          sendWithAgent: sendMessageResult,
          sendWithoutAgent: sendWithoutAgentResult,
          alternativeApi: alternativeApiResult
        },
        recommendation: chatEnabled 
          ? 'Chat is working! Check test results to see which method succeeded.'
          : 'Chat is not accessible. Check the error messages for clues.'
      });
    }
    
    // Try to get more info about the app/company
    let appInfo = null;
    try {
      console.log("[find-chat] Fetching app/company info...");
      // This might help understand permissions
      appInfo = {
        appId: process.env.WHOP_APP_ID,
        companyId: process.env.WHOP_COMPANY_ID,
        agentUserId: process.env.WHOP_AGENT_USER_ID,
        apiKeyPresent: !!process.env.WHOP_API_KEY,
        apiKeyLength: process.env.WHOP_API_KEY?.length
      };
    } catch (error: any) {
      console.log("[find-chat] Could not fetch app info:", error.message);
    }
    
    // Generate detailed recommendations
    const recommendations = [];
    const workingTest = testedExperiences[0];
    
    if (workingTest?.chatEnabled) {
      recommendations.push({
        type: "success",
        message: "✅ Chat connection is working!",
        action: "Check the test results to see which API method works"
      });
      
      // Find which method worked
      if (workingTest.tests.listMessages?.success) {
        recommendations.push({
          type: "info",
          message: "Can read messages from chat",
          action: "Use listMessagesFromChat API method"
        });
      }
      if (workingTest.tests.sendWithAgent?.success) {
        recommendations.push({
          type: "info",
          message: "Can send messages with agent user ID",
          action: "Use sendMessageToChat with sendAsAgentUserId parameter"
        });
      }
      if (workingTest.tests.sendWithoutAgent?.success) {
        recommendations.push({
          type: "info",
          message: "Can send messages without agent user ID",
          action: "Agent user ID may not be needed"
        });
      }
    } else {
      // Analyze the errors
      const listError = workingTest?.tests.listMessages?.error;
      const sendError = workingTest?.tests.sendWithAgent?.error;
      
      if (listError?.includes('Feed::ChatFeed was not found')) {
        recommendations.push({
          type: "error",
          message: "Experience is not configured as a chat",
          action: "Enable chat for this experience in Whop dashboard"
        });
      } else if (listError?.includes('unauthorized') || sendError?.includes('unauthorized')) {
        recommendations.push({
          type: "error",
          message: "Authentication/permission issue",
          action: "Check API key permissions and agent user ID"
        });
      } else if (listError || sendError) {
        recommendations.push({
          type: "warning",
          message: `API Error: ${listError || sendError}`,
          action: "Check the error details for more information"
        });
      }
      
      // Check agent user ID format
      if (process.env.WHOP_AGENT_USER_ID && !process.env.WHOP_AGENT_USER_ID.startsWith('user_')) {
        recommendations.push({
          type: "warning",
          message: "Agent user ID format may be incorrect",
          action: "Agent user ID should start with 'user_'"
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        testedExperiences: testedExperiences.length,
        workingChats: testedExperiences.filter(e => e.chatEnabled).length,
        timestamp: new Date().toISOString()
      },
      testedExperiences,
      recommendations,
      appInfo,
      debug: {
        agentUserId: process.env.WHOP_AGENT_USER_ID,
        experienceId: knownExperienceIds[0],
        apiKeyPresent: !!process.env.WHOP_API_KEY
      }
    });
  } catch (error: any) {
    console.error("[find-chat] Discovery failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to discover chat experiences",
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}