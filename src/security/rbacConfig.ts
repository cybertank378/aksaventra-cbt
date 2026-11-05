export type UserRole = "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT";

export const USER_ROLES: Record<UserRole, UserRole> = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  PROCTOR: "PROCTOR",
  STUDENT: "STUDENT",
};

/**
 * Prefix routes allowed without authentication.
 */
export const PUBLIC_ROUTE_PREFIXES = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/images",
  "/assets",
  "/fonts",
];

/**
 * Checks if a given URL path is public.
 */
export function isPublicRoute(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login") {
    return true;
  }
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Checks whether a user role has permission to access a given URL path.
 */
export function isRouteAuthorized(
  role: string | null | undefined,
  pathname: string,
): boolean {
  if (isPublicRoute(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  const normalizedRole = role.toUpperCase() as UserRole;

  // Student specific zone
  if (pathname.startsWith("/student") || pathname.startsWith("/api/attempts")) {
    return normalizedRole === "STUDENT" || normalizedRole === "ADMIN";
  }

  // Proctor specific zone
  if (
    pathname.startsWith("/dashboard/proctor") ||
    pathname.startsWith("/api/proctor")
  ) {
    return (
      normalizedRole === "PROCTOR" ||
      normalizedRole === "TEACHER" ||
      normalizedRole === "ADMIN"
    );
  }

  // Dashboard general / admin zone
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) {
    if (normalizedRole === "ADMIN") return true;
    if (normalizedRole === "TEACHER") {
      // Teachers can access courses, exams, results, proctor
      return !pathname.startsWith("/dashboard/admin/settings");
    }
    if (normalizedRole === "PROCTOR") {
      return pathname.startsWith("/dashboard/proctor");
    }
    return false;
  }

  // Default deny for unknown protected paths
  return false;
}

/**
 * Returns default landing page for a role after successful login.
 */
export function getDefaultRedirectForRole(role?: string | null): string {
  if (!role) return "/login";

  const normalizedRole = role.toUpperCase();
  switch (normalizedRole) {
    case "STUDENT":
      return "/student/lobby";
    case "PROCTOR":
      return "/dashboard/proctor";
    case "TEACHER":
    case "ADMIN":
      return "/dashboard";
    default:
      return "/login";
  }
}
