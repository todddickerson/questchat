import { headers } from "next/headers";
import { getUserFromHeaders, checkUserAccess } from "./whop";
import { notFound } from "next/navigation";

export async function authenticateUser() {
  try {
    const hdrs = await headers();
    const { userId } = await getUserFromHeaders(hdrs);
    return { userId };
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Authentication failed");
  }
}

export async function requireAccess(experienceId: string) {
  try {
    const { userId } = await authenticateUser();
    const hasAccess = await checkUserAccess(userId, experienceId);
    
    if (!hasAccess) {
      return notFound();
    }
    
    return { userId };
  } catch (error) {
    console.error("Access check failed:", error);
    return notFound();
  }
}

export function validateSignature(
  signature: string | null,
  secret: string = process.env.QUESTCHAT_SIGNING_SECRET || ""
): boolean {
  if (!signature || !secret) {
    return false;
  }
  
  return signature === secret;
}
