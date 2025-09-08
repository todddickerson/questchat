import { whop } from "./whop";

export async function sendChat(experienceId: string, message: string) {
  try {
    const result = await whop.messages.sendMessageToChat({
      experienceId,
      message,
    });
    return result;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

export async function findOrCreateChat(accessPassId?: string) {
  try {
    if (accessPassId) {
      const result = await whop.messages.findOrCreateChat({
        accessPassId,
        name: "QuestChat Community", // Required field
      });
      return result;
    }
    throw new Error("accessPassId is required to find or create chat");
  } catch (error) {
    console.error("Failed to find or create chat:", error);
    throw error;
  }
}

export async function listMessages(
  chatExperienceId: string,
  since?: number
) {
  try {
    const result = await whop.messages.listMessagesFromChat({
      chatExperienceId,
    });
    
    // Filter by timestamp if provided
    if (since && result?.posts) {
      return {
        ...result,
        posts: result.posts.filter((post: any) => 
          new Date(post.createdAt).getTime() >= since
        ),
      };
    }
    
    return result;
  } catch (error) {
    console.error("Failed to list messages:", error);
    throw error;
  }
}

export function generateDailyPrompts(): string[] {
  return [
    "🌅 Good morning! What's one thing you're excited about today?",
    "💪 What's a small win you had yesterday?",
    "🎯 Share one goal you're working towards this week!",
    "🧠 What's something new you learned recently?",
    "✨ What's bringing you joy today?",
    "🚀 What's one challenge you're ready to tackle?",
    "🙏 What's something you're grateful for right now?",
    "💡 Share a tip or insight that might help others!",
    "🔥 What's keeping you motivated this week?",
    "🌟 Describe your ideal day in 3 words!",
  ];
}

export function getRandomPrompt(): string {
  const prompts = generateDailyPrompts();
  return prompts[Math.floor(Math.random() * prompts.length)];
}
