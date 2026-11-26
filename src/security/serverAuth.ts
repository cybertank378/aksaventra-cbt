import "server-only";

import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { getEncodedJwtSecret } from "./jwtConfig";
import type { UserRole } from "./rbacConfig";

export interface VerifiedRequestSession {
  userId: string;
  username: string;
  role: UserRole;
  cbtId?: string;
  attemptId?: string;
  exp?: number;
}

function extractRawToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  const cookieToken = request.cookies.get("aksaventra_token")?.value;
  if (cookieToken) {
    return cookieToken.trim();
  }

  return null;
}

/**
 * Verifies the authenticated JWT directly from the incoming request cookie or
 * Authorization header without relying on mutable proxy headers.
 */
export async function verifyRequestSession(
  request: NextRequest,
): Promise<VerifiedRequestSession | null> {
  const token = extractRawToken(request);
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getEncodedJwtSecret());
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const rawUserId = payload.userId ?? payload.sub;
    const rawRole = typeof payload.role === "string" ? payload.role : "";
    if (!rawUserId || !rawRole) {
      return null;
    }

    return {
      userId: String(rawUserId),
      username: typeof payload.username === "string" ? payload.username : "",
      role: rawRole.toUpperCase() as UserRole,
      cbtId: payload.cbtId !== undefined ? String(payload.cbtId) : undefined,
      attemptId:
        payload.attemptId !== undefined ? String(payload.attemptId) : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireRequestRole(
  request: NextRequest,
  allowedRoles: readonly UserRole[],
): Promise<
  | { session: VerifiedRequestSession; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await verifyRequestSession(request);
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Autentikasi diperlukan untuk mengakses endpoint ini.",
          },
        },
        { status: 401 },
      ),
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Anda tidak memiliki izin untuk melakukan aksi ini.",
          },
        },
        { status: 403 },
      ),
    };
  }

  return { session, errorResponse: null };
}
