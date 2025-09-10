import { NextRequest, NextResponse } from "next/server";
import { discoverChatForExperience, validateChatAccess } from "@/lib/chat-discovery";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { experienceId } = await request.json();
    
    if (!experienceId) {
      return NextResponse.json(
        { error: "Experience ID is required" },
        { status: 400 }
      );
    }
    
    console.log("[discover-chat-v3] Starting discovery for:", experienceId);
    
    // Perform discovery with force refresh
    const chatId = await discoverChatForExperience(experienceId, true);
    
    if (!chatId) {
      console.log("[discover-chat-v3] No chat found");
      return NextResponse.json({
        success: false,
        chatId: null,
        message: "No chat channel found for this installation"
      });
    }
    
    console.log("[discover-chat-v3] Discovered chat:", chatId);
    
    // Validate access
    const hasAccess = await validateChatAccess(chatId);
    
    // Get chat details if possible
    let chatName = "Chat Channel";
    try {
      const experiences = await prisma.experience.findUnique({
        where: { experienceId },
        select: { name: true }
      });
      if (experiences?.name) {
        chatName = experiences.name;
      }
    } catch (error) {
      console.log("[discover-chat-v3] Could not fetch chat name");
    }
    
    // Save to database
    let saved = false;
    try {
      await prisma.experience.upsert({
        where: { experienceId },
        update: { chatExperienceId: chatId },
        create: {
          experienceId,
          chatExperienceId: chatId,
          name: "QuestChat Installation"
        }
      });
      saved = true;
      console.log("[discover-chat-v3] Saved to database");
    } catch (error) {
      console.error("[discover-chat-v3] Failed to save:", error);
    }
    
    return NextResponse.json({
      success: true,
      chatId,
      chatName,
      hasAccess,
      saved,
      message: hasAccess 
        ? "Chat channel discovered and configured successfully!" 
        : "Chat found but access may be limited"
    });
  } catch (error: any) {
    console.error("[discover-chat-v3] Discovery failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to discover chat",
        details: error.message
      },
      { status: 500 }
    );
  }
}