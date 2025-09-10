import { NextRequest, NextResponse } from "next/server";
import { autoDiscoverAndValidateChat } from "@/lib/chat-auto-discovery";

export async function POST(request: NextRequest) {
  try {
    const { experienceId } = await request.json();
    
    if (!experienceId) {
      return NextResponse.json(
        { error: "Experience ID is required" },
        { status: 400 }
      );
    }
    
    console.log("[API/auto-discover] Starting discovery for:", experienceId);
    
    const result = await autoDiscoverAndValidateChat(experienceId);
    
    console.log("[API/auto-discover] Result:", result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API/auto-discover] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to auto-discover chat",
        setupRequired: true,
        instructions: [
          "Please check your Whop API configuration",
          "Error: " + error.message
        ]
      },
      { status: 500 }
    );
  }
}