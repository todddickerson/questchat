import { WhopServerSdk } from "@whop/api";

const WHOP_API_KEY = "IoxDyQvZ0S1yP55sWgvfPOBur4LyveCumAbod0JyPZQ";
const WHOP_APP_ID = "app_F9H2JvGE8lfV4w";
const experienceId = "exp_ms5KOPv48rZVnh"; // QuestChat experience

const whop = WhopServerSdk({
  appApiKey: WHOP_API_KEY,
  appId: WHOP_APP_ID,
});

async function testChatValidation() {
  console.log("Testing chat validation for experience:", experienceId);
  
  try {
    // First, try to list experiences to see what's available
    console.log("\n1. Listing all experiences for company:");
    const experiences = await whop.experiences.listExperiences({
      companyId: "biz_CHKyxzlPRslE1Q",
      first: 50,
    });
    
    console.log("Available experiences:");
    experiences?.experiencesV2?.nodes?.forEach((exp) => {
      console.log(`  - ${exp.id}: ${exp.name || 'Unnamed'} (type: ${exp.type})`);
    });
    
    // Try to list messages from the experience
    console.log("\n2. Attempting to list messages from experience:", experienceId);
    try {
      const messages = await whop.messages.listMessagesFromChat({
        chatExperienceId: experienceId,
      });
      console.log("✅ Successfully listed messages, chat is valid!");
      console.log("Message count:", messages?.messages?.length || 0);
    } catch (msgError) {
      console.error("❌ Failed to list messages:", msgError.message);
      console.error("Full error:", msgError);
    }
    
    // Try to send a message as the agent user
    console.log("\n3. Attempting to send a test message:");
    try {
      const result = await whop.messages.sendMessageToChat({
        experienceId: experienceId,
        message: "🧪 Test message from QuestChat validation",
        sendAsAgentUserId: "user_efVmoTigk4GE0", // WHOP_AGENT_USER_ID
      });
      console.log("✅ Successfully sent message!");
      console.log("Message result:", result);
    } catch (sendError) {
      console.error("❌ Failed to send message:", sendError.message);
      console.error("Full error:", sendError);
    }
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

testChatValidation();