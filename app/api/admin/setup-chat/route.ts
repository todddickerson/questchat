import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// API endpoint to help set up chat functionality
export async function POST(request: NextRequest) {
  try {
    console.log("[setup-chat] Starting chat setup process...");
    
    const body = await request.json();
    const { action, accessPassId, experienceId } = body;
    
    const results = {
      action,
      success: false,
      details: null as any,
      recommendations: [] as any[],
    };
    
    // Option 1: Try to create a new chat using an access pass
    if (action === "create" && accessPassId) {
      try {
        console.log(`[setup-chat] Attempting to create chat for access pass ${accessPassId}...`);
        const chatResult = await whop.messages.findOrCreateChat({
          accessPassId,
          name: "QuestChat Community",
        });
        
        console.log("[setup-chat] ✅ Chat created/found successfully:", chatResult);
        results.success = true;
        results.details = chatResult;
        results.recommendations.push({
          type: "success",
          message: `Chat channel created/found: ${chatResult?.id || 'unknown'}`,
          action: "Use this experience ID in your configuration"
        });
      } catch (error: any) {
        console.error("[setup-chat] Failed to create chat:", error.message);
        results.details = { error: error.message };
        results.recommendations.push({
          type: "error",
          message: "Failed to create chat channel",
          action: error.message.includes("not found") 
            ? "Ensure the access pass ID is correct and has chat permissions"
            : "Check API permissions and try again"
        });
      }
    }
    
    // Option 2: Test if an experience can be used for chat
    if (action === "test" && experienceId) {
      try {
        console.log(`[setup-chat] Testing if ${experienceId} can be used for chat...`);
        
        // Test listing messages
        const messages = await whop.messages.listMessagesFromChat({
          chatExperienceId: experienceId,
        });
        
        console.log(`[setup-chat] ✅ Experience ${experienceId} supports chat!`);
        results.success = true;
        results.details = {
          experienceId,
          messageCount: messages?.posts?.length || 0,
          canListMessages: true,
        };
        
        // Test sending a message
        try {
          const testMessage = await whop.messages.sendMessageToChat({
            experienceId,
            message: `[QuestChat Setup Test] Testing message at ${new Date().toISOString()}`,
          });
          
          results.details.canSendMessages = true;
          results.recommendations.push({
            type: "success",
            message: "This experience is fully functional for chat",
            action: "You can use this experience ID for QuestChat"
          });
        } catch (sendError: any) {
          results.details.canSendMessages = false;
          results.details.sendError = sendError.message;
          results.recommendations.push({
            type: "warning",
            message: "Can read messages but cannot send",
            action: "Check WHOP_AGENT_USER_ID configuration"
          });
        }
      } catch (error: any) {
        console.error(`[setup-chat] Experience ${experienceId} cannot be used for chat:`, error.message);
        results.details = { 
          error: error.message,
          isChatFeed: false 
        };
        
        if (error.message?.includes('Feed::ChatFeed was not found')) {
          results.recommendations.push({
            type: "info",
            message: "This experience is not a chat channel",
            action: "You need to: 1) Enable chat for this experience in Whop dashboard, or 2) Create a new chat channel"
          });
        } else {
          results.recommendations.push({
            type: "error",
            message: "Failed to test experience",
            action: "Check the experience ID and API permissions"
          });
        }
      }
    }
    
    // Option 3: Provide setup instructions
    if (action === "instructions") {
      results.success = true;
      results.details = {
        steps: [
          {
            step: 1,
            title: "Install Whop Chat App",
            description: "Go to Whop App Store and install the Chat app for your company",
            url: "https://whop.com/apps"
          },
          {
            step: 2,
            title: "Create a Chat Channel",
            description: "In your Whop dashboard, create a new chat channel or enable chat for your experience",
            url: "https://whop.com/dashboard"
          },
          {
            step: 3,
            title: "Get the Experience ID",
            description: "Find the experience ID (exp_XXXXXXXX) for your chat channel",
            hint: "You can find this in the URL when viewing the chat in your dashboard"
          },
          {
            step: 4,
            title: "Configure QuestChat",
            description: "Update your QuestChat configuration with the correct chat experience ID",
            endpoint: "/api/experiences/[experienceId]/config"
          },
          {
            step: 5,
            title: "Test the Integration",
            description: "Use the test endpoints to verify messages can be sent and received",
            endpoints: [
              "/api/admin/test-prompt",
              "/api/admin/find-chat"
            ]
          }
        ]
      };
      results.recommendations.push({
        type: "info",
        message: "Follow these steps to set up chat",
        action: "Complete each step in order"
      });
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[setup-chat] Setup failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to set up chat",
        details: error.message 
      },
      { status: 500 }
    );
  }
}