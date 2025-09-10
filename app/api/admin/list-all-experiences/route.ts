import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// API endpoint to list ALL experiences to find the chat channel
export async function GET(request: NextRequest) {
  try {
    console.log("[list-experiences] Attempting to list all experiences...");
    
    const results = {
      experiences: [] as any[],
      chatCandidates: [] as any[],
      errors: [] as any[],
      summary: {} as any
    };
    
    // Try to list experiences without any filters
    try {
      console.log("[list-experiences] Trying to list experiences...");
      // The Whop SDK might have a different method for listing all experiences
      // Let's try different approaches
      
      // Approach 1: Try the basic listExperiences
      try {
        const exps = await whop.experiences.listExperiences({
          companyId: process.env.WHOP_COMPANY_ID!
        });
        console.log("[list-experiences] Method 1 found:", exps?.experiencesV2?.nodes?.length || 0, "experiences");
        if (exps?.experiencesV2?.nodes) {
          results.experiences.push(...exps.experiencesV2.nodes);
        }
      } catch (e: any) {
        console.log("[list-experiences] Method 1 failed:", e.message);
        results.errors.push({ method: "listExperiences", error: e.message });
      }
      
    } catch (error: any) {
      console.error("[list-experiences] Failed to list experiences:", error);
      results.errors.push({ general: error.message });
    }
    
    // Try to test specific chat experience IDs that might exist
    const potentialChatIds = [
      'exp_ms5KOPv48rZVnh', // QuestChat (we know this isn't a chat)
      // Common patterns for chat experiences
      'exp_chat', 
      'exp_community_chat',
      'exp_general_chat',
      // Try with different prefixes
      'chat_ms5KOPv48rZVnh',
      'feed_ms5KOPv48rZVnh',
    ];
    
    // Also try to extract any experience IDs from the environment
    const envKeys = Object.keys(process.env);
    envKeys.forEach(key => {
      const value = process.env[key];
      if (value && typeof value === 'string') {
        // Look for experience ID patterns
        if (value.startsWith('exp_') && value.length > 10) {
          potentialChatIds.push(value);
        }
      }
    });
    
    console.log("[list-experiences] Testing potential chat IDs:", potentialChatIds);
    
    // Test each potential chat ID
    for (const expId of Array.from(new Set(potentialChatIds))) {
      try {
        console.log(`[list-experiences] Testing ${expId}...`);
        const messages = await whop.messages.listMessagesFromChat({
          chatExperienceId: expId,
        });
        console.log(`[list-experiences] ✅ ${expId} is a valid chat! Found ${messages?.posts?.length || 0} messages`);
        results.chatCandidates.push({
          id: expId,
          isChat: true,
          messageCount: messages?.posts?.length || 0,
          status: 'success'
        });
      } catch (error: any) {
        if (!error.message?.includes('Feed::ChatFeed was not found')) {
          // This might be a different type of error worth noting
          console.log(`[list-experiences] ${expId} error:`, error.message);
          results.chatCandidates.push({
            id: expId,
            isChat: false,
            error: error.message,
            status: 'error'
          });
        }
      }
    }
    
    // Generate summary
    results.summary = {
      totalExperiences: results.experiences.length,
      chatCandidatesFound: results.chatCandidates.filter(c => c.isChat).length,
      errors: results.errors.length,
      recommendation: results.chatCandidates.some(c => c.isChat) 
        ? "Found working chat channels! Use one of these IDs."
        : "No chat channels found. You may need to install the Chat app in Whop or get the correct chat experience ID from your Whop dashboard."
    };
    
    // Add instructions for finding the chat ID manually
    const manualInstructions = {
      steps: [
        "1. Go to your Whop dashboard: https://whop.com/dashboard",
        "2. Find the Chat app or channel you want to use",
        "3. Look at the URL when viewing the chat - it should contain the experience ID",
        "4. The ID will look like: exp_XXXXXXXXXXXXX",
        "5. Update your .env.local file with: WHOP_CHAT_EXPERIENCE_ID=exp_XXXXXXXXXXXXX",
        "6. Use this ID instead of the QuestChat experience ID for chat operations"
      ],
      note: "The QuestChat experience ID (exp_ms5KOPv48rZVnh) is for your app, not for the chat channel itself."
    };
    
    return NextResponse.json({
      success: true,
      results,
      manualInstructions,
      debug: {
        questChatExpId: 'exp_ms5KOPv48rZVnh',
        agentUserId: process.env.WHOP_AGENT_USER_ID,
        appId: process.env.WHOP_APP_ID,
        companyId: process.env.WHOP_COMPANY_ID
      }
    });
  } catch (error: any) {
    console.error("[list-experiences] Failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to list experiences",
        details: error.message 
      },
      { status: 500 }
    );
  }
}