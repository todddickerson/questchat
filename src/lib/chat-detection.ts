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

export async function validateChatExperience(experienceId: string): Promise<boolean> {
  try {
    // Try to send a test message to validate the experience
    const testMessage = await whop.messages.listMessagesFromChat({
      chatExperienceId: experienceId,
    });
    
    // If we can list messages, the chat exists
    return true;
  } catch (error) {
    console.error(`Chat validation failed for ${experienceId}:`, error);
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