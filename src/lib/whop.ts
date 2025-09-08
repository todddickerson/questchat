"use server";

import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";

if (!process.env.WHOP_API_KEY) {
  throw new Error("WHOP_API_KEY is required");
}

if (!process.env.WHOP_APP_ID) {
  throw new Error("WHOP_APP_ID is required");
}

export const whop = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY,
  appId: process.env.WHOP_APP_ID, // app_xxxx
});

export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.WHOP_APP_ID,
  dontThrow: false,
});

export async function getUserFromHeaders(headers: Headers) {
  try {
    const token = headers.get("x-whop-user-token");
    if (!token) {
      throw new Error("No user token provided");
    }

    const { userId } = await verifyUserToken(token);
    return { userId };
  } catch (error) {
    console.error("Failed to verify user token:", error);
    throw new Error("Invalid user token");
  }
}

export async function checkUserAccess(userId: string, experienceId: string) {
  try {
    const result = await whop.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });
    return result.hasAccess;
  } catch (error) {
    console.error("Failed to check user access:", error);
    return false;
  }
}
