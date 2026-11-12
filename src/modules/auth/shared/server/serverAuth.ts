import { cache } from "react";
import { cookies } from "next/headers";
import { type AuthJwtPayload, verifyAuthToken } from "@/proxy";

/**
 * Returns the authenticated user session for the current request.
 * Memoized per-request with React cache to prevent redundant cookie reads
 * and repeated JWT cryptographic verification during SSR and navigation.
 */
export const getCurrentUser = cache(
  async (): Promise<AuthJwtPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("aksaventra_token")?.value;
    if (!token) {
      return null;
    }
    return await verifyAuthToken(token);
  },
);

