import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";

// Enhanced chat discovery using chat permissions
export async function GET(request: NextRequest) {
  try {
    console.log("[discover-chat-v2] Starting enhanced chat discovery with permissions...");
    
    const results = {
      method1_webhook: null as any,
      method2_experiences: [] as any[],
      method3_graphql: null as any,
      discoveredChats: [] as any[],
      recommendations: [] as string[],
    };
    
    // Method 1: Try to use chat webhook permissions
    try {
      console.log("[discover-chat-v2] Method 1: Trying webhook management...");
      // With chat:manage_webhook permission, we might be able to list webhooks
      // This could reveal chat experience IDs
      const webhookTest = null; // webhooks.list method not available in current SDK
      results.method1_webhook = webhookTest;
      console.log("[discover-chat-v2] Webhook result:", webhookTest);
    } catch (error: any) {
      console.log("[discover-chat-v2] Webhook method failed:", error.message);
      results.method1_webhook = { error: error.message };
    }
    
    // Method 2: List all experiences with better permissions
    try {
      console.log("[discover-chat-v2] Method 2: Listing experiences with permissions...");
      
      // Try different approaches to list experiences
      const approaches = [
        // Approach A: List without filters
        async () => {
          console.log("[discover-chat-v2] Trying listExperiences with company ID...");
          return await whop.experiences.listExperiences({
            first: 100,
            companyId: process.env.WHOP_COMPANY_ID!
          });
        },
        // Approach B: List with company ID from env
        async () => {
          console.log("[discover-chat-v2] Trying with company ID...");
          return await whop.experiences.listExperiences({
            companyId: process.env.WHOP_COMPANY_ID!,
            first: 100,
          });
        },
        // Approach C: List with app ID
        async () => {
          console.log("[discover-chat-v2] Trying with app ID...");
          return await whop.experiences.listExperiences({
            appId: process.env.WHOP_APP_ID,
            companyId: process.env.WHOP_COMPANY_ID!,
            first: 100,
          });
        },
      ];
      
      for (const approach of approaches) {
        try {
          const result = await approach();
          if (result?.experiencesV2?.nodes) {
            console.log(`[discover-chat-v2] Found ${result.experiencesV2.nodes.length} experiences`);
            results.method2_experiences.push(...result.experiencesV2.nodes);
            
            // Look for chat-type experiences
            const chatExps = result.experiencesV2.nodes.filter((exp: any) => {
              const isChat = exp.type === 'chat' || 
                             exp.type === 'community' || 
                             exp.type?.includes('chat') ||
                             exp.name?.toLowerCase().includes('chat');
              if (isChat) {
                console.log(`[discover-chat-v2] Found potential chat: ${exp.id} - ${exp.name} (${exp.type})`);
                results.discoveredChats.push({
                  id: exp.id,
                  name: exp.name,
                  type: exp.type,
                  method: 'listExperiences'
                });
              }
              return isChat;
            });
          }
          break; // If one approach works, stop trying others
        } catch (err: any) {
          console.log(`[discover-chat-v2] Approach failed:`, err.message);
        }
      }
    } catch (error: any) {
      console.log("[discover-chat-v2] Experience listing failed:", error.message);
      results.method2_experiences = [{ error: error.message }];
    }
    
    // Method 3: Try direct GraphQL query if SDK supports it
    try {
      console.log("[discover-chat-v2] Method 3: Trying raw API call...");
      
      // Make a direct API call to Whop's GraphQL endpoint
      const graphqlResponse = await fetch('https://api.whop.com/v5/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetChatExperiences {
              experiencesV2(first: 100) {
                nodes {
                  id
                  name
                  type
                  description
                  app {
                    id
                    name
                  }
                }
              }
            }
          `
        })
      });
      
      const graphqlData = await graphqlResponse.json();
      results.method3_graphql = graphqlData;
      
      if (graphqlData?.data?.experiencesV2?.nodes) {
        console.log(`[discover-chat-v2] GraphQL found ${graphqlData.data.experiencesV2.nodes.length} experiences`);
        
        // Filter for chat experiences
        const chatExps = graphqlData.data.experiencesV2.nodes.filter((exp: any) => {
          const isChat = exp.type === 'chat' || 
                         exp.app?.name?.toLowerCase().includes('chat') ||
                         exp.name?.toLowerCase().includes('chat');
          if (isChat) {
            console.log(`[discover-chat-v2] GraphQL found chat: ${exp.id} - ${exp.name}`);
            results.discoveredChats.push({
              id: exp.id,
              name: exp.name,
              type: exp.type,
              app: exp.app,
              method: 'graphql'
            });
          }
          return isChat;
        });
      }
    } catch (error: any) {
      console.log("[discover-chat-v2] GraphQL method failed:", error.message);
      results.method3_graphql = { error: error.message };
    }
    
    // Test each discovered chat ID
    const validChats = [];
    for (const chat of results.discoveredChats) {
      try {
        console.log(`[discover-chat-v2] Testing ${chat.id}...`);
        const messages = await whop.messages.listMessagesFromChat({
          chatExperienceId: chat.id,
        });
        console.log(`[discover-chat-v2] ✅ ${chat.id} is valid! ${messages?.posts?.length || 0} messages`);
        validChats.push({
          ...chat,
          valid: true,
          messageCount: messages?.posts?.length || 0
        });
      } catch (error: any) {
        console.log(`[discover-chat-v2] ${chat.id} failed:`, error.message);
        if (!error.message?.includes('Feed::ChatFeed was not found')) {
          validChats.push({
            ...chat,
            valid: false,
            error: error.message
          });
        }
      }
    }
    
    // Generate recommendations
    if (validChats.length > 0) {
      results.recommendations.push(
        `✅ Found ${validChats.length} chat experience(s)!`
      );
      validChats.forEach(chat => {
        if (chat.valid) {
          results.recommendations.push(
            `• ${chat.id} - ${chat.name || 'Unnamed'} (${chat.messageCount} messages)`
          );
        }
      });
      results.recommendations.push(
        "Copy one of these IDs and test it in the admin panel"
      );
    } else {
      results.recommendations.push(
        "❌ No chat experiences found automatically"
      );
      results.recommendations.push(
        "This could mean:"
      );
      results.recommendations.push(
        "1. The chat is in a different company/organization"
      );
      results.recommendations.push(
        "2. Your API key needs more permissions"
      );
      results.recommendations.push(
        "3. The chat experience hasn't been created yet"
      );
      results.recommendations.push(
        "Try creating a new chat channel in your Whop dashboard"
      );
    }
    
    // Add permission status
    const permissionStatus = {
      hasApiKey: !!process.env.WHOP_API_KEY,
      apiKeyLength: process.env.WHOP_API_KEY?.length,
      appId: process.env.WHOP_APP_ID,
      companyId: process.env.WHOP_COMPANY_ID,
      note: "Make sure you've added chat:manage_webhook and chat:moderate permissions"
    };
    
    return NextResponse.json({
      success: true,
      discoveredChats: validChats,
      results,
      permissionStatus,
      recommendations: results.recommendations,
      nextSteps: validChats.length > 0 ? [
        "1. Copy the chat experience ID from above",
        "2. Go to the admin panel",
        "3. Paste it in the 'Chat Channel Configuration' section",
        "4. Click 'Test This Chat ID'",
        "5. If it works, save it to your configuration"
      ] : [
        "1. Add the recommended permissions to your API key",
        "2. Regenerate your API key after adding permissions",
        "3. Update your .env.local with the new API key",
        "4. Restart your dev server",
        "5. Try this endpoint again"
      ]
    });
  } catch (error: any) {
    console.error("[discover-chat-v2] Discovery failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to discover chat",
        details: error.message,
        suggestion: "Make sure you've added the chat permissions to your API key"
      },
      { status: 500 }
    );
  }
}