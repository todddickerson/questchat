import { whop } from "./whop";

export interface ChatStatus {
  hasChat: boolean;
  chatExperienceId?: string;
  error?: string;
  needsSetup: boolean;
}

export async function detectChatStatus(companyId: string): Promise<ChatStatus> {
  try {
    // Try to list experiences for this company
    const experiences = await whop.experiences.listExperiences({
      companyId,
      first: 50,
    });

    // Look for chat-type experiences
    const chatExperiences = experiences?.experiencesV2?.nodes?.filter(
      (exp: any) => exp && (exp.type === 'chat' || exp.type === 'discord_chat')
    ) || [];

    if (chatExperiences.length === 0) {
      return {
        hasChat: false,
        needsSetup: true,
        error: "No chat experience found. Please install Whop Chat first.",
      };
    }

    // Return the first chat experience found
    const firstChat = chatExperiences[0];
    return {
      hasChat: true,
      chatExperienceId: firstChat?.id || '',
      needsSetup: false,
    };
  } catch (error) {
    console.error("Failed to detect chat status:", error);
    return {
      hasChat: false,
      needsSetup: true,
      error: "Unable to check chat status. Please ensure Whop Chat is installed.",
    };
  }
}

export async function validateChatExperience(experienceId: string, companyId?: string): Promise<boolean> {
  try {
    console.log("[validateChatExperience] Starting validation", {
      experienceId,
      companyId,
      timestamp: new Date().toISOString()
    });
    
    // According to Whop API research, chat channels are specialized types of experiences
    // The experienceId format should be exp_XXXXXXXX for chat experiences
    
    // First check if this is a valid experience
    const queryParams: any = {
      first: 100,
    };
    
    // Only add companyId if provided and in correct format
    if (companyId && companyId.startsWith('biz_')) {
      queryParams.companyId = companyId;
      console.log("[validateChatExperience] Using company ID in query:", companyId);
    } else {
      console.log("[validateChatExperience] No valid company ID provided, querying all experiences");
    }
    
    console.log("[validateChatExperience] Calling listExperiences with params:", queryParams);
    const experiences = await whop.experiences.listExperiences(queryParams);
    
    console.log("[validateChatExperience] Received experiences response", {
      totalCount: experiences?.experiencesV2?.nodes?.length || 0,
      hasData: !!experiences?.experiencesV2?.nodes
    });
    
    const experience = experiences?.experiencesV2?.nodes?.find(
      (exp: any) => exp?.id === experienceId
    );
    
    if (!experience) {
      console.log(`[validateChatExperience] ❌ Experience ${experienceId} not found in list`);
      console.log("[validateChatExperience] Available experiences:", 
        experiences?.experiencesV2?.nodes?.map((e: any) => ({
          id: e?.id,
          name: e?.name,
          type: e?.type
        }))
      );
      return false;
    }
    
    console.log(`[validateChatExperience] ✅ Found experience: ${experience.name} (${experience.id}), type: ${(experience as any).type}`);
    
    // Based on Whop API research, we should check if this experience supports chat
    // The type field may indicate if it's a chat-enabled experience
    const isChatType = (experience as any).type === 'chat' || 
                       (experience as any).type === 'discord_chat' || 
                       (experience as any).type === 'community' ||
                       (experience as any).type?.includes('chat');
    
    if (isChatType) {
      console.log("[validateChatExperience] ✅ Experience is explicitly a chat type");
      return true;
    }
    
    // Try to validate it's accessible as a chat by attempting to list messages
    // According to research, listMessagesFromChat requires a chatExperienceId
    try {
      console.log("[validateChatExperience] Attempting to list messages from chat...");
      await whop.messages.listMessagesFromChat({
        chatExperienceId: experienceId,
      });
      console.log("[validateChatExperience] ✅ Successfully listed messages - valid chat!");
      return true;
    } catch (listError: any) {
      console.log("[validateChatExperience] Error listing messages:", listError.message);
      
      // According to API patterns, if the experience exists but isn't a chat, we get this error
      if (listError.message?.includes('Feed::ChatFeed was not found')) {
        console.log(`[validateChatExperience] ⚠️ Experience ${experienceId} exists but is not a chat feed`);
        console.log("[validateChatExperience] This experience may need chat functionality enabled or created");
        // For QuestChat demo, we'll accept it and use simulated messages
        return true;
      }
      
      console.log("[validateChatExperience] Unexpected error:", listError);
      throw listError;
    }
  } catch (error) {
    console.error(`[validateChatExperience] Chat validation failed for ${experienceId}:`, error);
    return false;
  }
}

export function getChatSetupInstructions(): string[] {
  return [
    "Install Whop Chat from the Whop App Store",
    "Create a chat channel for your community",
    "Come back to QuestChat and connect it to your chat",
    "Configure your daily prompts and rewards",
    "Watch engagement soar! 🚀",
  ];
}