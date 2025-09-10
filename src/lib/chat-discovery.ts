import { whop } from "./whop";
import { prisma } from "./db";

interface DiscoveredChat {
  id: string;
  name?: string;
  type?: string;
  valid: boolean;
  messageCount?: number;
}

export async function discoverChatForExperience(
  questChatExperienceId: string,
  forceRefresh = false
): Promise<string | null> {
  try {
    console.log("[chat-discovery] Starting discovery for experience:", questChatExperienceId);
    
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = await getCachedChatId(questChatExperienceId);
      if (cached) {
        console.log("[chat-discovery] Using cached chat ID:", cached);
        return cached;
      }
    }
    
    // Discover chat experience
    const chatId = await performChatDiscovery(questChatExperienceId);
    
    if (chatId) {
      // Cache the discovered ID
      await cacheChatId(questChatExperienceId, chatId);
      console.log("[chat-discovery] Cached chat ID:", chatId);
    }
    
    return chatId;
  } catch (error) {
    console.error("[chat-discovery] Discovery failed:", error);
    return null;
  }
}

async function getCachedChatId(experienceId: string): Promise<string | null> {
  try {
    const experience = await prisma.experience.findUnique({
      where: { experienceId },
      select: { chatExperienceId: true }
    });
    
    return experience?.chatExperienceId || null;
  } catch (error) {
    console.error("[chat-discovery] Cache lookup failed:", error);
    return null;
  }
}

async function cacheChatId(experienceId: string, chatExperienceId: string): Promise<void> {
  try {
    await prisma.experience.upsert({
      where: { experienceId },
      update: { chatExperienceId },
      create: {
        experienceId,
        chatExperienceId,
        name: "QuestChat Experience"
      }
    });
  } catch (error) {
    console.error("[chat-discovery] Cache update failed:", error);
  }
}

async function performChatDiscovery(questChatExperienceId: string): Promise<string | null> {
  console.log("[chat-discovery] Performing discovery...");
  
  const discoveredChats: DiscoveredChat[] = [];
  
  // Method 1: List all experiences and find chat types
  try {
    console.log("[chat-discovery] Method 1: Listing experiences...");
    
    const approaches = [
      // Try without filters
      async () => await whop.experiences.listExperiences({ 
        companyId: process.env.WHOP_COMPANY_ID!,
        first: 100 
      }),
      // Try with company ID
      async () => await whop.experiences.listExperiences({
        companyId: process.env.WHOP_COMPANY_ID!,
        first: 100
      }),
      // Try with app ID
      async () => await whop.experiences.listExperiences({
        appId: process.env.WHOP_APP_ID,
        companyId: process.env.WHOP_COMPANY_ID!,
        first: 100
      })
    ];
    
    for (const approach of approaches) {
      try {
        const result = await approach();
        if (result?.experiencesV2?.nodes) {
          console.log(`[chat-discovery] Found ${result.experiencesV2.nodes.length} experiences`);
          
          // Look for chat-type experiences
          for (const exp of result.experiencesV2.nodes) {
            if (!exp) continue;
            
            // Skip the QuestChat experience itself
            if (exp.id === questChatExperienceId) continue;
            
            const isChat = (exp as any).type === 'chat' || 
                          (exp as any).type === 'community' || 
                          exp.app?.name?.toLowerCase().includes('chat') ||
                          exp.name?.toLowerCase().includes('chat');
            
            if (isChat) {
              console.log(`[chat-discovery] Found potential chat: ${exp.id} - ${exp.name} (${(exp as any).type})`);
              discoveredChats.push({
                id: exp.id,
                name: exp.name || undefined,
                type: (exp as any).type,
                valid: false
              });
            }
          }
          
          if (discoveredChats.length > 0) break;
        }
      } catch (err: any) {
        console.log(`[chat-discovery] Approach failed:`, err.message);
      }
    }
  } catch (error: any) {
    console.log("[chat-discovery] Method 1 failed:", error.message);
  }
  
  // Method 2: Try direct GraphQL query
  if (discoveredChats.length === 0) {
    try {
      console.log("[chat-discovery] Method 2: Direct GraphQL query...");
      
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
      
      if (graphqlData?.data?.experiencesV2?.nodes) {
        for (const exp of graphqlData.data.experiencesV2.nodes) {
          if (exp.id === questChatExperienceId) continue;
          
          const isChat = exp.type === 'chat' || 
                        exp.app?.name?.toLowerCase().includes('chat');
          
          if (isChat) {
            console.log(`[chat-discovery] GraphQL found chat: ${exp.id} - ${exp.name}`);
            discoveredChats.push({
              id: exp.id,
              name: exp.name,
              type: exp.type,
              valid: false
            });
          }
        }
      }
    } catch (error: any) {
      console.log("[chat-discovery] Method 2 failed:", error.message);
    }
  }
  
  // Test each discovered chat
  console.log(`[chat-discovery] Testing ${discoveredChats.length} potential chats...`);
  
  for (const chat of discoveredChats) {
    try {
      console.log(`[chat-discovery] Testing ${chat.id}...`);
      const messages = await whop.messages.listMessagesFromChat({
        chatExperienceId: chat.id,
      });
      
      console.log(`[chat-discovery] ✅ ${chat.id} is valid! ${messages?.posts?.length || 0} messages`);
      chat.valid = true;
      chat.messageCount = messages?.posts?.length || 0;
      
      // Return the first valid chat
      return chat.id;
    } catch (error: any) {
      console.log(`[chat-discovery] ${chat.id} failed:`, error.message);
    }
  }
  
  // If no valid chat found, try the environment variable as fallback
  if (process.env.WHOP_CHAT_EXPERIENCE_ID) {
    console.log("[chat-discovery] Using environment fallback:", process.env.WHOP_CHAT_EXPERIENCE_ID);
    return process.env.WHOP_CHAT_EXPERIENCE_ID;
  }
  
  console.log("[chat-discovery] No valid chat found");
  return null;
}

export async function validateChatAccess(chatExperienceId: string): Promise<boolean> {
  try {
    console.log("[chat-discovery] Validating chat access:", chatExperienceId);
    
    const messages = await whop.messages.listMessagesFromChat({
      chatExperienceId,
    });
    
    console.log("[chat-discovery] ✅ Chat access validated");
    return true;
  } catch (error: any) {
    console.log("[chat-discovery] ❌ Chat access failed:", error.message);
    return false;
  }
}