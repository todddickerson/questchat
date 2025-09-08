import { NextRequest, NextResponse } from "next/server";
import { validateChatExperience } from "@/lib/chat-detection";

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

    // Validate the chat experience
    const isValid = await validateChatExperience(experienceId);

    return NextResponse.json({
      valid: isValid,
      experienceId,
      message: isValid 
        ? "Chat experience validated successfully"
        : "Invalid chat experience ID or chat not accessible",
    });
  } catch (error) {
    console.error("Chat validation failed:", error);
    return NextResponse.json(
      { 
        valid: false, 
        error: "Failed to validate chat experience" 
      },
      { status: 500 }
    );
  }
}