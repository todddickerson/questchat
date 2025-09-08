import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper functions for common database operations
export async function findOrCreateUser(whopUserId: string, username?: string) {
  return await prisma.user.upsert({
    where: { whopUserId },
    update: username ? { username } : {},
    create: {
      whopUserId,
      username,
    },
  });
}

export async function findOrCreateExperience(
  experienceId: string,
  accessPassId?: string,
  name?: string
) {
  return await prisma.experience.upsert({
    where: { experienceId },
    update: {},
    create: {
      experienceId,
      accessPassId,
      name,
    },
  });
}

export async function getOrCreateStreak(experienceId: string, userId: string) {
  return await prisma.streak.upsert({
    where: {
      experienceId_userId: {
        experienceId,
        userId,
      },
    },
    update: {},
    create: {
      experienceId,
      userId,
    },
  });
}
