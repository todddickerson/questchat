import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { verifyUserToken } from "@/lib/whop";
import ClientWrapper from "./client-wrapper";
import LeaderboardClient from "./leaderboard-client";

export default async function ExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  try {
    // Try to get user from Whop iframe token
    let userId: string | null = null;
    let currentUserStreak = null;
    
    try {
      const hdrs = await headers();
      const token = hdrs.get("x-whop-user-token");
      
      if (token) {
        const tokenData = await verifyUserToken(token);
        userId = tokenData.userId;
        
        // Get current user's streak if authenticated
        if (userId) {
          currentUserStreak = await prisma.streak.findUnique({
            where: {
              experienceId_userId: {
                experienceId: params.experienceId,
                userId,
              },
            },
            include: {
              user: true,
            },
          });
        }
      }
    } catch (authError) {
      // Auth is optional for viewing - just log the error
      console.log("Auth token not available:", authError);
    }
    
    // Create experience if it doesn't exist
    let experience = await prisma.experience.findUnique({
      where: { experienceId: params.experienceId },
      include: {
        config: true,
      },
    });

    if (!experience) {
      // Auto-create the experience
      experience = await prisma.experience.create({
        data: {
          experienceId: params.experienceId,
          name: "QuestChat Experience",
        },
        include: {
          config: true,
        },
      });
    }

    // Get today's date for display
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get top streaks
    const topStreaks = await prisma.streak.findMany({
      where: { experienceId: params.experienceId },
      orderBy: [
        { current: 'desc' },
        { best: 'desc' },
      ],
      take: 20,
      include: {
        user: true,
      },
    });

    // Get weekly leaders
    const weeklyLeaders = await prisma.streak.findMany({
      where: { 
        experienceId: params.experienceId,
        weekCount: { gt: 0 }
      },
      orderBy: { weekCount: 'desc' },
      take: 10,
      include: {
        user: true,
      },
    });

    return (
      <ClientWrapper experienceId={params.experienceId}>
        <LeaderboardClient
          experienceId={params.experienceId}
          topStreaks={topStreaks}
          weeklyLeaders={weeklyLeaders}
          currentUserStreak={currentUserStreak}
          experience={experience}
          today={today}
        />
      </ClientWrapper>
    );
  } catch (error) {
    console.error("Error loading experience:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load leaderboard
          </h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}