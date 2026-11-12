import { cookies } from "next/headers";
import { type AuthJwtPayload, verifyAuthToken } from "@/proxy";

/**
 * Returns the authenticated user session for the current request.
 * Uses Next.js 16 `"use cache: private"` to satisfy Cache Components
 * runtime cookie access during client navigations.
 */
export async function getCurrentUser(): Promise<AuthJwtPayload | null> {
  "use cache: private";
  const cookieStore = await cookies();
  const token = cookieStore.get("aksaventra_token")?.value;
  if (!token) {
    return null;
  }
  return await verifyAuthToken(token);
}


