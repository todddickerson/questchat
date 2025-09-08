import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedExperience() {
  const experienceId = "exp_ms5KOPv48rZVnh";
  
  try {
    // Check if experience exists
    let experience = await prisma.experience.findUnique({
      where: { experienceId },
    });
    
    if (!experience) {
      console.log("Creating experience:", experienceId);
      experience = await prisma.experience.create({
        data: {
          experienceId,
          name: "FitBro2 QuestChat",
          accessPassId: "prod_01HZ3QXKBFZ8W5X9Y2V7T6N4M8", // You may need to update this
        },
      });
      console.log("✅ Experience created");
    } else {
      console.log("✅ Experience already exists");
    }
    
    // Create default config if it doesn't exist
    if (!experience.config) {
      console.log("Creating default config...");
      await prisma.config.create({
        data: {
          experienceId,
          promptTimeUTC: "09:00",
          graceMinutes: 90,
          rewardPercentage: 20,
          rewardStock: 1,
          rewardExpiryDays: 7,
          minStreak3: 3,
          minStreak7: 7,
          questsJson: JSON.stringify([
            "What's your biggest fitness goal for this week?",
            "Share your workout win from today!",
            "What healthy meal are you planning today?",
            "What motivates you to stay consistent?",
            "Drop your favorite exercise and why!",
          ]),
        },
      });
      console.log("✅ Config created");
    }
    
    console.log("\n📊 Experience Summary:");
    console.log("ID:", experienceId);
    console.log("Name:", experience.name);
    console.log("Ready for Whop integration!");
    
  } catch (error) {
    console.error("❌ Error seeding experience:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExperience();