import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const { experienceId } = params;

    // Get experience with config
    const experience = await prisma.experience.findUnique({
      where: { experienceId },
      include: {
        config: true,
        quests: true,
      },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    // Return config or defaults
    const config = experience.config || {
      promptTimeUTC: "09:00",
      graceMinutes: 90,
      rewardPercentage: 20,
      rewardStock: 1,
      rewardExpiryDays: 7,
      minStreak3: 3,
      minStreak7: 7,
    };

    return NextResponse.json({
      config: {
        promptTime: config.promptTimeUTC,
        gracePeriod: config.graceMinutes,
        percentage: config.rewardPercentage,
        stock: config.rewardStock,
        expiryDays: config.rewardExpiryDays,
      },
      quests: experience.quests.map(q => ({
        id: q.id,
        prompt: q.title,
      })),
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const { experienceId } = params;
    const body = await request.json();
    const { config, quests } = body;

    // Ensure experience exists
    let experience = await prisma.experience.findUnique({
      where: { experienceId },
    });

    if (!experience) {
      // Create experience if it doesn't exist
      experience = await prisma.experience.create({
        data: {
          experienceId,
          name: "QuestChat Experience",
        },
      });
    }

    // Upsert config
    await prisma.config.upsert({
      where: { experienceId },
      update: {
        promptTimeUTC: config.promptTime,
        graceMinutes: config.gracePeriod,
        rewardPercentage: config.percentage,
        rewardStock: config.stock,
        rewardExpiryDays: config.expiryDays,
      },
      create: {
        experienceId,
        promptTimeUTC: config.promptTime,
        graceMinutes: config.gracePeriod,
        rewardPercentage: config.percentage,
        rewardStock: config.stock,
        rewardExpiryDays: config.expiryDays,
      },
    });

    // Update quests - delete existing and recreate
    if (quests && Array.isArray(quests)) {
      await prisma.quest.deleteMany({
        where: { experienceId },
      });

      for (const questPrompt of quests) {
        await prisma.quest.create({
          data: {
            experienceId,
            code: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: questPrompt,
            description: questPrompt,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}