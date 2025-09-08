import { NextRequest, NextResponse } from "next/server";
import { validateSignature } from "@/lib/auth";
import { sendChat } from "@/lib/chat";
import { prisma } from "@/lib/db";

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
      try {
        // Get top weekly performers
        const topPerformers = await prisma.streak.findMany({
          where: {
            experienceId: experience.experienceId,
            weekCount: { gt: 0 },
          },
          orderBy: { weekCount: 'desc' },
          take: 10,
          include: {
            user: true,
          },
        });

        if (topPerformers.length > 0) {
          // Format leaderboard message
          let leaderboardMessage = "🏆 **WEEKLY LEADERBOARD** 🏆\n\n";
          leaderboardMessage += "Here are this week's most active members:\n\n";

          topPerformers.forEach((performer, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            const username = performer.user.username || `User ${performer.user.whopUserId.slice(-6)}`;
            leaderboardMessage += `${medal} **${username}** - ${performer.weekCount} days active\n`;
          });

          leaderboardMessage += "\n🎯 Keep up the great work, champions!\n";
          leaderboardMessage += "📅 *Weekly leaderboard resets every Monday*";

          // Try to post to chat (don't fail if chat is unavailable)
          try {
            await sendChat(experience.experienceId, leaderboardMessage);
          } catch (chatError) {
            console.error(`Failed to post weekly leaderboard to chat:`, chatError);
          }
        }

        // Reset weekly counts
        await prisma.streak.updateMany({
          where: {
            experienceId: experience.experienceId,
          },
          data: {
            weekCount: 0,
          },
        });

        results.push({
          experienceId: experience.experienceId,
          status: "success",
          topPerformers: topPerformers.length,
        });
      } catch (error) {
        console.error(`Failed to process weekly leaderboard for ${experience.experienceId}:`, error);
        results.push({
          experienceId: experience.experienceId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Weekly cron failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}