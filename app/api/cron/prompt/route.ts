import { NextRequest, NextResponse } from "next/server";
import { validateSignature } from "@/src/lib/auth";
import { sendChat, getRandomPrompt } from "@/src/lib/chat";
import { prisma } from "@/src/lib/db";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    // Validate signature for security
    const signature = request.headers.get("x-questchat-signature");
    if (!validateSignature(signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const today = format(new Date(), "yyyy-MM-dd");
    
    // Get all configured experiences
    const experiences = await prisma.experience.findMany({
      include: {
        config: true,
      },
      where: {
        config: {
          isNot: null,
        },
      },
    });

    const results = [];

    for (const experience of experiences) {
      if (!experience.config) continue;

      try {
        // Check if we already posted today
        const existingPrompt = await prisma.messageLog.findFirst({
          where: {
            experienceId: experience.experienceId,
            dayKey: today,
            userId: "SYSTEM", // System user for prompts
          },
        });

        if (existingPrompt) {
          results.push({
            experienceId: experience.experienceId,
            status: "already_posted",
          });
          continue;
        }

        // Generate and send prompt
        const prompt = getRandomPrompt();
        const message = `🌟 **Daily Quest** (${today})\n\n${prompt}\n\n💡 *First reply counts toward your streak!*`;

        await sendChat(experience.experienceId, message);

        // Record that we posted the prompt
        await prisma.messageLog.create({
          data: {
            experienceId: experience.experienceId,
            userId: "SYSTEM",
            dayKey: today,
            firstPostAt: new Date(),
          },
        });

        results.push({
          experienceId: experience.experienceId,
          status: "posted",
          prompt,
        });
      } catch (error) {
        console.error(`Failed to post prompt for ${experience.experienceId}:`, error);
        results.push({
          experienceId: experience.experienceId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      results,
    });
  } catch (error) {
    console.error("Prompt cron failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
