import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const experienceCount = await prisma.experience.count();
    
    // Get headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    
    // Check for Whop-specific headers
    const whopHeaders = Object.keys(headers).filter(key => 
      key.toLowerCase().includes('whop') || 
      key.toLowerCase().includes('x-forwarded')
    );
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        experiences: experienceCount,
      },
      whop: {
        apiKeyConfigured: !!process.env.WHOP_API_KEY,
        appIdConfigured: !!process.env.WHOP_APP_ID,
        companyIdConfigured: !!process.env.WHOP_COMPANY_ID,
        agentUserIdConfigured: !!process.env.WHOP_AGENT_USER_ID,
      },
      request: {
        url: request.url,
        method: request.method,
        whopHeaders: whopHeaders.reduce((acc, key) => {
          acc[key] = headers[key];
          return acc;
        }, {} as Record<string, string>),
      },
      cors: {
        allowedOrigins: ["https://whop.com", "https://*.whop.com"],
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Enable CORS for Whop iframe
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}