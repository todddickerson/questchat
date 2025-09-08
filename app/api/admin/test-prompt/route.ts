import { NextRequest, NextResponse } from "next/server";
import { sendChat, getRandomPrompt } from "@/lib/chat";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experienceId } = body;

    if (!experienceId) {
      return NextResponse.json(
        { error: "experienceId is required" },
        { status: 400 }
      );
    }

    const today = format(new Date(), "yyyy-MM-dd");
    
    // Check if we already posted today
    const existingPrompt = await prisma.messageLog.findFirst({
      where: {
        experienceId,
        dayKey: today,
        userId: "SYSTEM",
      },
    });

    if (existingPrompt) {
      return NextResponse.json({
        success: false,
        message: "Prompt already posted today",
      });
    }

    // Generate and send prompt
    const prompt = getRandomPrompt();
    const message = `🌟 **Daily Quest** (${today})\n\n${prompt}\n\n💡 *First reply counts toward your streak!*`;

    try {
      await sendChat(experienceId, message);
    } catch (chatError) {
      console.error("Failed to send chat message:", chatError);
      return NextResponse.json(
        { error: "Failed to send message to chat. Is the experience ID valid?" },
        { status: 400 }
      );
    }

    // Record that we posted the prompt
    await prisma.messageLog.create({
      data: {
        experienceId,
        userId: "SYSTEM",
        dayKey: today,
        firstPostAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      prompt,
      message: "Test prompt posted successfully",
    });
  } catch (error) {
    console.error("Test prompt failed:", error);
    return NextResponse.json(
      { error: "Failed to post test prompt" },
      { status: 500 }
    );
  }
}