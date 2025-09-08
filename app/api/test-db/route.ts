import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Simplest possible database test
    console.log("Testing database connection...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database query result:", result);
    
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      result: result,
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}