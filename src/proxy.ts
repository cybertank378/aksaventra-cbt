import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import {
  getDefaultRedirectForRole,
  isPublicRoute,
  isRouteAuthorized,
  type UserRole,
} from "./security/rbacConfig";
import { validateSebHeaders } from "./security/sebHeaderValidator";

export interface AuthJwtPayload {
  userId: number | string;
  username: string;
  role: UserRole;
  cbtId?: number | string;
  attemptId?: number | string;
  exp?: number;
}

const JWT_SECRET =
  process.env.CBT_JWT_SECRET ||
  "aksaventra_default_jwt_secret_dev_key_32_chars_long";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

/**
 * Extracts raw JWT token from Authorization header or cookies.
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Try Bearer token in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Try cookie
  const cookieToken = request.cookies.get("aksaventra_token")?.value;
  if (cookieToken) {
    return cookieToken.trim();
  }

  return null;
}

/**
 * Verifies JWT token and extracts AuthJwtPayload safely.
 */
export async function verifyAuthToken(
  token: string,
): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
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
 * Enforces JWT verification, RBAC permissions, and optional SEB verification.
 */
export async function proxyMiddleware(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Skip public assets and unrestricted routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
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

  // 4. Optional Safe Exam Browser validation for student exam routes
  const requireSebHeader = request.headers.get("x-require-seb") === "true";
  const isExamWorkspaceRoute = pathname.startsWith("/student/exam/");

  if (
    requireSebHeader ||
    (isExamWorkspaceRoute && process.env.ENFORCE_SEB_GLOBAL === "true")
  ) {
    const requestHash = request.headers.get("x-safeexambrowser-requesthash");
    const configKeyHash = request.headers.get(
      "x-safeexambrowser-configkeyhash",
    );
    const userAgent = request.headers.get("user-agent");
    const expectedBek = process.env.SEB_BROWSER_EXAM_KEY;

    if (expectedBek) {
      const sebResult = validateSebHeaders({
        requestUrl: request.url,
        requestHashHeader: requestHash,
        configKeyHashHeader: configKeyHash,
        expectedBrowserExamKey: expectedBek,
        userAgent,
        requireSebUserAgent: true,
      });

      if (!sebResult.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SEB_VERIFICATION_FAILED",
              message:
                sebResult.reason || "Safe Exam Browser verification failed",
            },
          },
          { status: 403 },
        );
      }
    }
  }

  // 5. Inject authenticated user context into request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(authUser.userId));
  requestHeaders.set("x-user-username", authUser.username);
  requestHeaders.set("x-user-role", authUser.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
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
