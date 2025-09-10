import { whop } from "./whop";
import { prisma } from "./db";
import { validateChatExperience } from "./chat-detection";

export interface ChatDiscoveryResult {
  success: boolean;
  chatId?: string;
  chatName?: string;
  error?: string;
  setupRequired?: boolean;
  instructions?: string[];
}

/**
 * Automatically discovers and validates the chat channel for a QuestChat installation
 */
export async function autoDiscoverAndValidateChat(
  questChatExperienceId: string
): Promise<ChatDiscoveryResult> {
  console.log("[auto-discovery] 🚀 Starting discovery for experience:", questChatExperienceId);
  console.log("[auto-discovery] Environment check:", {
    nodeEnv: process.env.NODE_ENV,
    whopApiKey: process.env.WHOP_API_KEY ? '✅ Present' : '❌ Missing',
    whopApiKeyLength: process.env.WHOP_API_KEY?.length || 0,
    whopApiKeyPrefix: process.env.WHOP_API_KEY?.substring(0, 10) + '...',
    whopCompanyId: process.env.WHOP_COMPANY_ID || 'Not set',
    whopAppId: process.env.WHOP_APP_ID || 'Not set'
  });
  
  try {
    // Step 1: Check if we have a cached chat ID
    const experience = await prisma.experience.findUnique({
      where: { experienceId: questChatExperienceId },
      select: { chatExperienceId: true, name: true }
    });
    
    if (experience?.chatExperienceId) {
      console.log("[auto-discovery] Found cached chat ID:", experience.chatExperienceId);
      
      // Validate it still works
      const isValid = await validateChatChannel(experience.chatExperienceId);
      if (isValid) {
        console.log("[auto-discovery] ✅ Cached chat ID is valid");
        return {
          success: true,
          chatId: experience.chatExperienceId,
          chatName: experience.name || "Chat Channel"
        };
      }
      
      console.log("[auto-discovery] ⚠️ Cached chat ID no longer valid, re-discovering...");
    }
    
    // Step 2: Discover chat channels
    console.log("[auto-discovery] 🔍 Starting chat channel discovery...");
    const chatId = await discoverChatChannel(questChatExperienceId);
    
    console.log("[auto-discovery] 📋 Discovery completed with result:", {
      chatId,
      found: !!chatId,
      willProceedToValidation: !!chatId
    });
    
    if (!chatId) {
      console.log("[auto-discovery] ❌ No chat channel found - discovery methods exhausted");
      return {
        success: false,
        error: "No chat channel connected to this QuestChat installation",
        setupRequired: true,
        instructions: [
          "1. Go to your Whop dashboard",
          "2. Create or select a Chat channel",
          "3. Connect it to QuestChat",
          "4. Refresh this page"
        ]
      };
    }
    
    console.log("[auto-discovery] 🎯 Chat channel discovered:", chatId);
    
    // Step 3: Validate the discovered chat
    const canSend = await validateChatChannel(chatId);
    
    if (!canSend) {
      console.log("[auto-discovery] ⚠️ Chat found but cannot send messages");
      return {
        success: false,
        chatId,
        error: "Chat channel found but QuestChat doesn't have permission to post",
        setupRequired: true,
        instructions: [
          "1. Go to your Whop API settings",
          "2. Add 'chat:moderate' permission to your API key",
          "3. Regenerate the API key",
          "4. Update your environment variables",
          "5. Restart the application"
        ]
      };
    }
    
    // Step 4: Cache the validated chat ID
    await prisma.experience.upsert({
      where: { experienceId: questChatExperienceId },
      update: { chatExperienceId: chatId },
      create: {
        experienceId: questChatExperienceId,
        chatExperienceId: chatId,
        name: "QuestChat Installation"
      }
    });
    
    console.log("[auto-discovery] ✅ Successfully discovered and cached chat:", chatId);
    
    return {
      success: true,
      chatId,
      chatName: "Chat Channel"
    };
    
  } catch (error: any) {
    console.error("[auto-discovery] Fatal error:", error);
    return {
      success: false,
      error: "Failed to discover chat channel",
      setupRequired: true,
      instructions: [
        "Please check:",
        "1. Your Whop API key is valid",
        "2. Your app has the required permissions",
        "3. Your database connection is working",
        "Error: " + error.message
      ]
    };
  }
}

/**
 * Discovers available chat channels for the QuestChat installation
 */
async function discoverChatChannel(questChatExperienceId: string): Promise<string | null> {
  console.log("[auto-discovery] 📋 Starting discovery with methods...");
  
  try {
    // Try multiple discovery methods
    const methods = [
      // Method 0: Check for the newly created chat channel explicitly
      async () => {
        console.log("[auto-discovery] 🔍 Method 0: Checking for new chat channel exp_LwconBozdmaNrk...");
        const newChatId = 'exp_LwconBozdmaNrk';
        try {
          console.log("[auto-discovery] Testing access to new chat:", newChatId);
          const result = await whop.messages.listMessagesFromChat({
            chatExperienceId: newChatId
          });
          console.log("[auto-discovery] ✅ New chat channel accessible:", newChatId);
          console.log("[auto-discovery] Messages response:", {
            hasData: !!result,
            postCount: result?.posts?.length || 0
          });
          return newChatId;
        } catch (error: any) {
          console.log("[auto-discovery] ❌ Cannot access new chat:", newChatId);
          console.log("[auto-discovery] Full error object:", {
            message: error.message,
            name: error.name,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response,
            stack: error.stack?.split('\n').slice(0, 3).join('\n')
          });
          // Try to parse error for more details
          if (error.response) {
            console.log("[auto-discovery] Error response details:", JSON.stringify(error.response, null, 2));
          }
          return null;
        }
      },
      // Method 1: Find actual Chat app for this company (exclude QuestChat itself)
      async () => {
        console.log("[auto-discovery] 🔍 Method 1: Finding actual Chat app for company...");
        console.log("[auto-discovery] Excluding QuestChat experience:", questChatExperienceId);
        try {
          // Include company ID if available
          const params: any = { first: 100 };
          if (process.env.WHOP_COMPANY_ID) {
            params.companyId = process.env.WHOP_COMPANY_ID;
            console.log("[auto-discovery] Including company ID in query:", process.env.WHOP_COMPANY_ID);
          }
          
          const result = await whop.experiences.listExperiences(params);
          console.log("[auto-discovery] API response received:", {
            hasNodes: !!result?.experiencesV2?.nodes,
            nodeCount: result?.experiencesV2?.nodes?.length || 0,
            totalCount: result?.experiencesV2?.totalCount
          });
          
          if (result?.experiencesV2?.nodes) {
            for (const exp of result.experiencesV2.nodes) {
              if (!exp) continue;
              
              console.log("[auto-discovery] Checking experience:", {
                id: exp.id,
                name: exp.name,
                type: (exp as any).type,
                appName: exp.app?.name,
                isQuestChat: exp.id === questChatExperienceId
              });
              
              // Skip the QuestChat experience itself
              if (exp.id === questChatExperienceId) {
                console.log("[auto-discovery] ⏭️ Skipping QuestChat experience:", exp.id);
                continue;
              }
              
              // Look for actual Chat apps/experiences
              const isChat = (exp as any).type === 'chat' || 
                           exp.app?.name?.toLowerCase().includes('chat') ||
                           exp.name?.toLowerCase().includes('chat') ||
                           exp.app?.name?.toLowerCase() === 'chat' ||
                           (exp as any).type === 'discord_chat' ||
                           (exp as any).type === 'community';
              
              console.log("[auto-discovery] Is chat experience?", isChat, "- Reason:", {
                typeIsChat: (exp as any).type === 'chat',
                appNameHasChat: exp.app?.name?.toLowerCase().includes('chat'),
                nameHasChat: exp.name?.toLowerCase().includes('chat'),
                appNameIsChat: exp.app?.name?.toLowerCase() === 'chat',
                typeIsDiscordChat: (exp as any).type === 'discord_chat',
                typeIsCommunity: (exp as any).type === 'community'
              });
              
              if (isChat) {
                // Test if we can access it as a chat channel
                console.log("[auto-discovery] Testing access to chat:", exp.id);
                try {
                  const msgResult = await whop.messages.listMessagesFromChat({
                    chatExperienceId: exp.id
                  });
                  console.log("[auto-discovery] ✅ Found accessible chat:", exp.id);
                  console.log("[auto-discovery] Messages found:", msgResult?.posts?.length || 0);
                  return exp.id;
                } catch (error: any) {
                  console.log("[auto-discovery] ❌ Cannot access chat:", exp.id, error.message);
                  console.log("[auto-discovery] Error details for", exp.id, ":", {
                    message: error.message,
                    statusCode: error.statusCode,
                    code: error.code
                  });
                }
              }
            }
          }
          return null;
        } catch (error: any) {
          console.log("[auto-discovery] ❌ Method 1 failed:", error.message);
          return null;
        }
      },
      // Method 2: List all experiences and find chat types
      async () => {
        console.log("[auto-discovery] 🔍 Method 2: Scanning all experiences for chat types...");
        try {
          // Include company ID if available
          const params: any = { first: 100 };
          if (process.env.WHOP_COMPANY_ID) {
            params.companyId = process.env.WHOP_COMPANY_ID;
            console.log("[auto-discovery] Including company ID in query:", process.env.WHOP_COMPANY_ID);
          }
          
          const result = await whop.experiences.listExperiences(params);
          console.log("[auto-discovery] API response received:", {
            hasNodes: !!result?.experiencesV2?.nodes,
            nodeCount: result?.experiencesV2?.nodes?.length || 0,
            totalCount: result?.experiencesV2?.totalCount
          });
          
          if (result?.experiencesV2?.nodes) {
            for (const exp of result.experiencesV2.nodes) {
              if (!exp) continue;
              
              console.log("[auto-discovery] Checking experience:", {
                id: exp.id,
                name: exp.name,
                type: (exp as any).type,
                appName: exp.app?.name,
                isQuestChat: exp.id === questChatExperienceId
              });
              
              if (exp.id === questChatExperienceId) continue;
              
              // Check if it's a chat experience - be more inclusive
              const isChat = (exp as any).type === 'chat' || 
                           exp.app?.name?.toLowerCase().includes('chat') ||
                           exp.name?.toLowerCase().includes('chat') ||
                           exp.name?.toLowerCase() === 'ai chat' ||
                           exp.id?.includes('chat');
              
              console.log("[auto-discovery] Is chat experience?", isChat, "- Reason:", {
                typeIsChat: (exp as any).type === 'chat',
                appNameHasChat: exp.app?.name?.toLowerCase().includes('chat'),
                nameHasChat: exp.name?.toLowerCase().includes('chat'),
                nameIsAIChat: exp.name?.toLowerCase() === 'ai chat',
                idHasChat: exp.id?.includes('chat')
              });
              
              if (isChat) {
                // Test if we can access it
                console.log("[auto-discovery] Testing access to chat:", exp.id);
                try {
                  const msgResult = await whop.messages.listMessagesFromChat({
                    chatExperienceId: exp.id
                  });
                  console.log("[auto-discovery] ✅ Found accessible chat:", exp.id);
                  console.log("[auto-discovery] Messages found:", msgResult?.posts?.length || 0);
                  return exp.id;
                } catch (error: any) {
                  console.log("[auto-discovery] ❌ Cannot access chat:", exp.id, error.message);
                  console.log("[auto-discovery] Error details for", exp.id, ":", {
                    message: error.message,
                    statusCode: error.statusCode,
                    code: error.code
                  });
                }
              }
            }
          }
          return null;
        } catch (error: any) {
          console.log("[auto-discovery] ❌ Method 2 failed:", error.message);
          return null;
        }
      },
      
      // Method 3: GraphQL direct query
      async () => {
        console.log("[auto-discovery] 🔍 Method 3: Direct GraphQL query...");
        try {
          const response = await fetch('https://api.whop.com/v5/graphql', {
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
                      app {
                        name
                      }
                    }
                  }
                }
              `
            })
          });
          
          const data = await response.json();
          console.log("[auto-discovery] GraphQL response:", {
            hasData: !!data?.data,
            hasNodes: !!data?.data?.experiencesV2?.nodes,
            nodeCount: data?.data?.experiencesV2?.nodes?.length || 0,
            errors: data?.errors
          });
          
          if (data?.data?.experiencesV2?.nodes) {
            for (const exp of data.data.experiencesV2.nodes) {
              console.log("[auto-discovery] GraphQL experience:", {
                id: exp.id,
                name: exp.name,
                type: (exp as any).type,
                appName: exp.app?.name
              });
              
              if (exp.id === questChatExperienceId) continue;
              
              if ((exp as any).type === 'chat' || exp.app?.name?.toLowerCase().includes('chat')) {
                console.log("[auto-discovery] Testing GraphQL chat:", exp.id);
                try {
                  await whop.messages.listMessagesFromChat({
                    chatExperienceId: exp.id
                  });
                  console.log("[auto-discovery] ✅ GraphQL found chat:", exp.id);
                  return exp.id;
                } catch (error: any) {
                  console.log("[auto-discovery] ❌ GraphQL chat access failed:", exp.id, error.message);
                }
              }
            }
          }
          return null;
        } catch (error: any) {
          console.log("[auto-discovery] ❌ Method 3 failed:", error.message);
          return null;
        }
      }
    ];
    
    // Try each method until one succeeds
    console.log("[auto-discovery] 🔄 Trying", methods.length, "discovery methods (including explicit new chat check)...");
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      console.log("[auto-discovery] 🚀 Executing method", i + 1, "of", methods.length);
      try {
        const chatId = await method();
        console.log("[auto-discovery] 📊 Method", i + 1, "result:", { chatId, type: typeof chatId, truthyCheck: !!chatId });
        if (chatId) {
          console.log("[auto-discovery] 🎉 Method", i + 1, "succeeded with chat ID:", chatId);
          return chatId;
        }
        console.log("[auto-discovery] ❌ Method", i + 1, "returned null/falsy");
      } catch (error: any) {
        console.log("[auto-discovery] 💥 Method", i + 1, "threw error:", {
          message: error.message,
          name: error.name,
          code: error.code || 'UNKNOWN'
        });
      }
    }
    
    console.log("[auto-discovery] 💥 All methods exhausted, no chat found");
    return null;
  } catch (error: any) {
    console.error("[auto-discovery] 🔥 Critical discovery error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
}

/**
 * Validates that we can actually send messages to a chat channel
 */
async function validateChatChannel(chatExperienceId: string): Promise<boolean> {
  try {
    console.log("[auto-discovery] Validating chat channel:", chatExperienceId);
    console.log("[auto-discovery] Using API key prefix:", process.env.WHOP_API_KEY?.substring(0, 10) + '...');
    
    // Test 1: Can we list messages?
    const messages = await whop.messages.listMessagesFromChat({
      chatExperienceId
    });
    
    console.log("[auto-discovery] ✅ Can list messages, found:", messages?.posts?.length || 0);
    console.log("[auto-discovery] Messages response structure:", {
      hasMessages: !!messages,
      hasPosts: !!messages?.posts,
      postCount: messages?.posts?.length || 0,
      firstPost: messages?.posts?.[0] ? 'Present' : 'None'
    });
    
    // Test 2: Can we send a message? (Only test in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        await whop.messages.sendMessageToChat({
          experienceId: chatExperienceId,
          message: "🤖 QuestChat validation test (ignore this message)"
        });
        console.log("[auto-discovery] ✅ Can send messages");
        return true;
      } catch (error: any) {
        // If we can list but not send, it's a permission issue
        console.log("[auto-discovery] ⚠️ Can list but cannot send messages:", error.message);
        return false;
      }
    }
    
    // In production, just check if we can list messages
    return true;
    
  } catch (error: any) {
    console.log("[auto-discovery] ❌ Cannot access chat:", error.message);
    return false;
  }
}

/**
 * Gets the current chat discovery status for display
 */
export async function getChatDiscoveryStatus(experienceId: string): Promise<{
  hasChat: boolean;
  chatId?: string;
  isValid: boolean;
  lastChecked: Date;
  error?: string;
}> {
  try {
    const experience = await prisma.experience.findUnique({
      where: { experienceId },
      select: { 
        chatExperienceId: true,
        updatedAt: true
      }
    });
    
    if (!experience?.chatExperienceId) {
      return {
        hasChat: false,
        isValid: false,
        lastChecked: new Date(),
        error: "No chat channel configured"
      };
    }
    
    const isValid = await validateChatChannel(experience.chatExperienceId);
    
    return {
      hasChat: true,
      chatId: experience.chatExperienceId,
      isValid,
      lastChecked: experience.updatedAt
    };
    
  } catch (error: any) {
    return {
      hasChat: false,
      isValid: false,
      lastChecked: new Date(),
      error: error.message
    };
  }
}