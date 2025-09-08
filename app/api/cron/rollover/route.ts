import { NextRequest, NextResponse } from "next/server";
import { validateSignature } from "@/lib/auth";
import { listMessages, sendChat } from "@/lib/chat";
import { createPromoCode } from "@/lib/rewards";
import { prisma } from "@/lib/db";
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
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd");
    
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
        // Get yesterday's prompt timestamp
        const systemPrompt = await prisma.messageLog.findFirst({
          where: {
            experienceId: experience.experienceId,
            userId: "SYSTEM",
            dayKey: yesterday,
          },
        });

        if (!systemPrompt) {
          results.push({
            experienceId: experience.experienceId,
            status: "no_prompt_yesterday",
          });
          continue;
        }

        // Get messages since the prompt
        const messages = await listMessages(
          experience.experienceId,
          systemPrompt.firstPostAt.getTime()
        );

        if (!messages?.posts) {
          results.push({
            experienceId: experience.experienceId,
            status: "no_messages",
          });
          continue;
        }

        // Process each user's first message
        const userMessages = new Map<string, any>();
        for (const post of messages.posts) {
          // Type guard and extract user info from different post types
          const postData = post as any;
          const userId = postData.user?.id || postData.userId || postData.sender?.id;
          const username = postData.user?.username || postData.username || postData.sender?.username;
          
          // Skip if no user ID or if it's a system message
          if (!userId || userId === "SYSTEM") continue;
          
          // Only track first message per user
          if (!userMessages.has(userId)) {
            userMessages.set(userId, {
              ...postData,
              userId,
              username,
              createdAt: postData.createdAt || postData.created_at || new Date(),
            });
          }
        }

        // Update streaks for users who responded
        const streakUpdates = [];
        const rewards = [];

        for (const [userId, message] of Array.from(userMessages.entries())) {
          // Check if we already processed this user today
          const existingLog = await prisma.messageLog.findUnique({
            where: {
              experienceId_userId_dayKey: {
                experienceId: experience.experienceId,
                userId,
                dayKey: yesterday,
              },
            },
          });

          if (existingLog) continue; // Already processed

          // Find or create user
          const user = await prisma.user.upsert({
            where: { whopUserId: userId },
            update: {},
            create: {
              whopUserId: userId,
              username: message.username || null,
            },
          });

          // Log the message
          await prisma.messageLog.create({
            data: {
              experienceId: experience.experienceId,
              userId: user.id,
              dayKey: yesterday,
              firstPostAt: new Date(message.createdAt),
            },
          });

          // Update or create streak
          let streak = await prisma.streak.findUnique({
            where: {
              experienceId_userId: {
                experienceId: experience.experienceId,
                userId: user.id,
              },
            },
          });

          if (streak) {
            // Update existing streak
            streak = await prisma.streak.update({
              where: {
                experienceId_userId: {
                  experienceId: experience.experienceId,
                  userId: user.id,
                },
              },
              data: {
                current: streak.current + 1,
                best: Math.max(streak.best, streak.current + 1),
                weekCount: streak.weekCount + 1,
                lastPostAt: new Date(),
              },
            });
          } else {
            // Create new streak
            streak = await prisma.streak.create({
              data: {
                experienceId: experience.experienceId,
                userId: user.id,
                current: 1,
                best: 1,
                weekCount: 1,
                lastPostAt: new Date(),
              },
            });
          }

          streakUpdates.push({
            userId: user.id,
            currentStreak: streak.current,
          });

          // Check for rewards (3 and 7 day streaks)
          if (streak.current === 3 || streak.current === 7) {
            // Check if reward already exists
            const existingReward = await prisma.reward.findFirst({
              where: {
                userId: user.id,
                experienceId: experience.experienceId,
                threshold: streak.current,
                type: 'streak',
              },
            });

            if (!existingReward && experience.accessPassId) {
              try {
                // Create promo code
                const { promoCode, issuedCode } = await createPromoCode(
                  experience.accessPassId,
                  user.id,
                  user.username || user.whopUserId,
                  {
                    percentage: experience.config.rewardPercentage,
                    stock: experience.config.rewardStock,
                    expiryDays: experience.config.rewardExpiryDays,
                  }
                );

                // Create reward record
                const reward = await prisma.reward.create({
                  data: {
                    userId: user.id,
                    experienceId: experience.experienceId,
                    type: 'streak',
                    threshold: streak.current,
                    issuedCodeId: issuedCode.id,
                  },
                });

                // Send congratulations message
                const congratsMessage = `🎉 **Congratulations ${user.username || 'Champion'}!** 🎉\n\n` +
                  `You've reached a **${streak.current}-day streak!** 🔥\n\n` +
                  `Here's your reward: **${experience.config.rewardPercentage}% OFF**\n` +
                  `Promo Code: \`${issuedCode.code}\`\n\n` +
                  `Keep going for more rewards! 🚀`;

                await sendChat(experience.experienceId, congratsMessage);

                rewards.push({
                  userId: user.id,
                  streakDay: streak.current,
                  code: issuedCode.code,
                });
              } catch (error) {
                console.error(`Failed to create reward for user ${user.id}:`, error);
              }
            }
          }
        }

        // Reset streaks for users who didn't respond
        const activeUsers = Array.from(userMessages.keys());
        if (activeUsers.length > 0) {
          await prisma.streak.updateMany({
            where: {
              experienceId: experience.experienceId,
              userId: {
                notIn: await prisma.user.findMany({
                  where: { whopUserId: { in: activeUsers } },
                  select: { id: true },
                }).then(users => users.map(u => u.id)),
              },
            },
            data: {
              current: 0,
            },
          });
        }

        results.push({
          experienceId: experience.experienceId,
          status: "processed",
          usersActive: userMessages.size,
          streaksUpdated: streakUpdates.length,
          rewardsIssued: rewards.length,
        });
      } catch (error) {
        console.error(`Failed to process experience ${experience.experienceId}:`, error);
        results.push({
          experienceId: experience.experienceId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: yesterday,
      results,
    });
  } catch (error) {
    console.error("Rollover cron failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}