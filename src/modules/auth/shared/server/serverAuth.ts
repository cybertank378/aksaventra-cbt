import { cookies } from "next/headers";
import { type AuthJwtPayload, verifyAuthToken } from "@/proxy";

export async function getCurrentUser(): Promise<AuthJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("aksaventra_token")?.value;
  if (!token) {
    return null;
  }
  return await verifyAuthToken(token);
}
