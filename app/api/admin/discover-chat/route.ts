import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// API endpoint to discover chat experiences using various methods
export async function GET(request: NextRequest) {
  try {
    console.log("[discover-chat] Starting comprehensive chat discovery...");
    
    const results = {
      method1_listExperiences: null as any,
      method2_findOrCreate: null as any,
      method3_knownPatterns: [] as any[],
      recommendations: [] as string[],
      possibleChatIds: [] as string[],
    };
    
    // Method 1: Try to list experiences without company ID (might work differently)
    try {
      console.log("[discover-chat] Method 1: Attempting to list experiences...");
      // Try with minimal parameters
      const experiences = await (whop as any).graphql({
        query: `
          query ListExperiences {
            experiencesV2 {
              nodes {
                id
                name
                type
                description
              }
            }
          }
        `
      });
      
      console.log("[discover-chat] GraphQL response:", experiences);
      results.method1_listExperiences = experiences;
      
      // Look for chat-type experiences
      if (experiences?.data?.experiencesV2?.nodes) {
        const chatExps = experiences.data.experiencesV2.nodes.filter((exp: any) => 
          exp.type === 'chat' || 
          exp.type === 'community' || 
          exp.name?.toLowerCase().includes('chat')
        );
        chatExps.forEach((exp: any) => {
          results.possibleChatIds.push(exp.id);
        });
      }
    } catch (error: any) {
      console.log("[discover-chat] Method 1 failed:", error.message);
      results.method1_listExperiences = { error: error.message };
    }
    
    // Method 2: Try to find or create a chat (might reveal existing chat ID)
    try {
      console.log("[discover-chat] Method 2: Attempting findOrCreateChat...");
      // Try with the company/access pass from the URL
      const companyId = 'biz_CHKyxzlPRslE1Q'; // From your env
      const possibleAccessPasses = [
        'prod_9YN0sLdPM38Oxs', // From previous attempts
        'fitbro2-0', // From the URL
        'chat-message-U5B7TYbwZZyuA9', // From the URL
      ];
      
      for (const accessPass of possibleAccessPasses) {
        try {
          console.log(`[discover-chat] Trying findOrCreateChat with ${accessPass}...`);
          const chatResult = await whop.messages.findOrCreateChat({
            accessPassId: accessPass,
            name: "QuestChat Discovery Test",
          });
          console.log(`[discover-chat] Success with ${accessPass}:`, chatResult);
          results.method2_findOrCreate = chatResult;
          if (chatResult?.id) {
            results.possibleChatIds.push(chatResult.id);
          }
          break;
        } catch (e: any) {
          console.log(`[discover-chat] Failed with ${accessPass}:`, e.message);
        }
      }
    } catch (error: any) {
      console.log("[discover-chat] Method 2 failed:", error.message);
      results.method2_findOrCreate = { error: error.message };
    }
    
    // Method 3: Test known patterns based on URL structure
    const urlParts = {
      company: 'fitbro2-0',
      messageOrChannel: 'chat-message-U5B7TYbwZZyuA9',
      shortId: 'U5B7TYbwZZyuA9',
    };
    
    // Common experience ID patterns to test
    const testPatterns = [
      // Based on the URL structure
      `exp_${urlParts.shortId}`,
      `exp_${urlParts.messageOrChannel}`,
      `exp_chat_${urlParts.shortId}`,
      
      // Common chat experience patterns
      'exp_chat',
      'exp_community',
      'exp_general',
      
      // Variations with company
      `exp_${urlParts.company}_chat`,
      `exp_${urlParts.company}`,
    ];
    
    console.log("[discover-chat] Method 3: Testing pattern-based IDs...");
    for (const testId of testPatterns) {
      try {
        console.log(`[discover-chat] Testing ${testId}...`);
        const messages = await whop.messages.listMessagesFromChat({
          chatExperienceId: testId,
        });
        console.log(`[discover-chat] ✅ ${testId} is valid! Found ${messages?.posts?.length || 0} messages`);
        results.method3_knownPatterns.push({
          id: testId,
          valid: true,
          messageCount: messages?.posts?.length || 0,
        });
        results.possibleChatIds.push(testId);
      } catch (error: any) {
        // Only log if it's not the standard "not found" error
        if (!error.message?.includes('Feed::ChatFeed was not found')) {
          console.log(`[discover-chat] ${testId} error:`, error.message);
          results.method3_knownPatterns.push({
            id: testId,
            valid: false,
            error: error.message,
          });
        }
      }
    }
    
    // Generate recommendations
    if (results.possibleChatIds.length > 0) {
      results.recommendations.push(
        `✅ Found ${results.possibleChatIds.length} possible chat ID(s): ${results.possibleChatIds.join(', ')}`
      );
      results.recommendations.push(
        "Test each ID in the admin panel to verify which one works for your chat"
      );
    } else {
      results.recommendations.push(
        "❌ Could not automatically discover chat ID"
      );
      results.recommendations.push(
        "Manual steps to find your chat experience ID:"
      );
      results.recommendations.push(
        "1. Go to https://whop.com/dashboard"
      );
      results.recommendations.push(
        "2. Click on your Chat app/channel"
      );
      results.recommendations.push(
        "3. Look for 'exp_' in the URL or page source"
      );
      results.recommendations.push(
        "4. Or check the browser's Network tab for API calls containing experience IDs"
      );
    }
    
    // Add specific advice for the URL structure
    results.recommendations.push(
      "Note: 'chat-message-U5B7TYbwZZyuA9' appears to be a message/channel ID, not an experience ID"
    );
    results.recommendations.push(
      "Experience IDs always start with 'exp_' followed by alphanumeric characters"
    );
    
    return NextResponse.json({
      success: true,
      urlAnalysis: {
        providedUrl: "https://whop.com/joined/fitbro2-0/chat-message-U5B7TYbwZZyuA9/app/",
        parts: urlParts,
        note: "This URL structure doesn't directly contain the experience ID"
      },
      results,
      possibleChatIds: Array.from(new Set(results.possibleChatIds)), // Remove duplicates
      nextSteps: [
        "1. Try each discovered ID in the admin panel's 'Test This Chat ID' field",
        "2. If none work, check the browser DevTools Network tab while on the chat page",
        "3. Look for API calls to /graphql or /api that might contain 'exp_' IDs",
        "4. The actual chat experience ID will start with 'exp_'"
      ]
    });
  } catch (error: any) {
    console.error("[discover-chat] Discovery failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to discover chat",
        details: error.message,
        suggestion: "Try checking the browser DevTools Network tab for API calls containing experience IDs"
      },
      { status: 500 }
    );
  }
}