import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { getEncodedJwtSecret } from "./security/jwtConfig";
import {
  getDefaultRedirectForRole,
  isPublicRoute,
  isRouteAuthorized,
  type UserRole,
} from "./security/rbacConfig";

export interface AuthJwtPayload {
  userId: number | string;
  username: string;
  role: UserRole;
  cbtId?: number | string;
  attemptId?: number | string;
  moodleToken?: string;
  exp?: number;
}

/**
 * Extracts raw JWT token from Authorization header or cookies.
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
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
 * Verifies JWT token and extracts AuthJwtPayload safely without caching
 * so expired or invalidated tokens are rejected immediately.
 */
export async function verifyAuthToken(
  token: string,
): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedJwtSecret());
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const role = (payload.role as string)?.toUpperCase() as UserRole;
    return {
      userId: (payload.userId as number | string) || (payload.sub as string),
      username: (payload.username as string) || "",
      role,
      cbtId: payload.cbtId as number | string | undefined,
      attemptId: payload.attemptId as number | string | undefined,
      exp: payload.exp,
    };
  } catch (_err) {
    return null;
  }
}

/**
 * Edge proxy middleware handler for Aksaventra CBT.
 * Strips spoofable identity headers, enforces JWT verification, and checks RBAC.
 */
export async function proxyMiddleware(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Always strip client-supplied identity headers before routing
  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete("x-user-id");
  sanitizedHeaders.delete("x-user-username");
  sanitizedHeaders.delete("x-user-role");

  if (isPublicRoute(pathname)) {
    return NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    });
  }

  // 2. Extract and verify JWT token
  const token = extractTokenFromRequest(request);
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to access this resource",
          },
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const authUser = await verifyAuthToken(token);
  if (!authUser) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOKEN_INVALID_OR_EXPIRED",
            message:
              "Session has expired or token is invalid. Please log in again.",
          },
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. RBAC route authorization check
  const isAuthorized = isRouteAuthorized(authUser.role, pathname);
  if (!isAuthorized) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "You do not have the required permissions to access this endpoint.",
          },
        },
        { status: 403 },
      );
    }

    const targetUrl = new URL(
      getDefaultRedirectForRole(authUser.role),
      request.url,
    );
    return NextResponse.redirect(targetUrl);
  }

  sanitizedHeaders.set("x-user-id", String(authUser.userId));
  sanitizedHeaders.set("x-user-username", authUser.username);
  sanitizedHeaders.set("x-user-role", authUser.role);

  return NextResponse.next({
    request: {
      headers: sanitizedHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|assets|fonts).*)",
  ],
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  return await proxyMiddleware(request);
}

export default proxy;
