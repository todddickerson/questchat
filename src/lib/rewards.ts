import { whop } from "./whop";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createPromoCode(
  accessPassId: string,
  userId: string,
  username: string,
  config: {
    percentage: number;
    stock: number;
    expiryDays: number;
  }
) {
  try {
    const code = `QUEST-${username}-${Date.now()}`.toUpperCase();
    const expirationDatetime = Math.floor(Date.now() / 1000) + 
      60 * 60 * 24 * config.expiryDays;

    const promoCode = await whop.promoCodes.createPromoCode({
      accessPassId,
      promoType: "percentage",
      amountOff: config.percentage,
      baseCurrency: "usd",
      code,
      numberOfIntervals: 1,
      stock: config.stock,
      expirationDatetime,
      onePerCustomer: true,
      newUsersOnly: false,
    });

    // Store the issued code in our database
    const issuedCode = await prisma.issuedCode.create({
      data: {
        code,
        promoId: promoCode.id,
        expiresAt: new Date(expirationDatetime * 1000),
      },
    });

    return { promoCode, issuedCode };
  } catch (error) {
    console.error("Failed to create promo code:", error);
    throw error;
  }
}

export async function checkExistingReward(
  experienceId: string,
  userId: string,
  type: string,
  threshold: number
) {
  try {
    const existingReward = await prisma.reward.findFirst({
      where: {
        experienceId,
        userId,
        type,
        threshold,
      },
    });

    return existingReward !== null;
  } catch (error) {
    console.error("Failed to check existing reward:", error);
    return false;
  }
}

export async function createReward(
  experienceId: string,
  userId: string,
  type: string,
  threshold: number,
  issuedCodeId?: string
) {
  try {
    const reward = await prisma.reward.create({
      data: {
        experienceId,
        userId,
        type,
        threshold,
        issuedCodeId,
      },
    });

    return reward;
  } catch (error) {
    console.error("Failed to create reward:", error);
    throw error;
  }
}
