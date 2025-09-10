import { NextRequest, NextResponse } from "next/server";
import { validateChatExperience } from "@/lib/chat-detection";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experienceId, companyId } = body;
    
    console.log("[API/validate-chat] Request received", {
      experienceId,
      companyId,
      envCompanyId: process.env.WHOP_COMPANY_ID,
      timestamp: new Date().toISOString()
    });

    if (!experienceId) {
      console.log("[API/validate-chat] Missing experienceId");
      return NextResponse.json(
        { error: "experienceId is required" },
        { status: 400 }
      );
    }

    // Pass company ID from env if not provided
    const finalCompanyId = companyId || process.env.WHOP_COMPANY_ID;
    console.log("[API/validate-chat] Using company ID:", finalCompanyId);
    
    // Validate the chat experience
    const isValid = await validateChatExperience(experienceId, finalCompanyId);
    
    console.log("[API/validate-chat] Validation result", {
      experienceId,
      isValid,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      valid: isValid,
      experienceId,
      message: isValid 
        ? "Chat experience validated successfully"
        : "Invalid chat experience ID or chat not accessible",
    });
  } catch (error) {
    console.error("[API/validate-chat] Chat validation failed:", error);
    return NextResponse.json(
      { 
        valid: false, 
        error: "Failed to validate chat experience" 
      },
      { status: 500 }
    );
  }
}