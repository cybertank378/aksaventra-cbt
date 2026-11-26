export type UserRole = "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT";

export const USER_ROLES: Record<UserRole, UserRole> = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  PROCTOR: "PROCTOR",
  STUDENT: "STUDENT",
};

export const roleConfig: Record<
  UserRole,
  { label: string; color: string; description: string }
> = {
  ADMIN: {
    label: "Administrator",
    color: "primary",
    description: "Akses penuh manajemen CBT dan sistem",
  },
  TEACHER: {
    label: "Guru / Pembuat Soal",
    color: "info",
    description: "Manajemen soal, jadwal, dan nilai",
  },
  PROCTOR: {
    label: "Pengawas Ruangan",
    color: "warning",
    description: "Pengawasan langsung dan intervensi ujian",
  },
  STUDENT: {
    label: "Siswa",
    color: "secondary",
    description: "Peserta pengerjaan ujian",
  },
};

/**
 * Prefix routes allowed without authentication.
 */
export const PUBLIC_ROUTE_PREFIXES = [
  "/login",
  "/exam",
  "/templates",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/moodle-launch",
  "/api/sync/moodle-webhook",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/manifest.webmanifest",
  "/icon0.svg",
  "/icon1.png",
  "/apple-icon.png",
  "/robots.txt",
  "/sitemap.xml",
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

  // Authenticated user common endpoints
  if (
    pathname === "/api/users/me" ||
    pathname.startsWith("/api/announcements")
  ) {
    return true;
  }

  // Student specific zone
  if (
    pathname === "/student" ||
    pathname.startsWith("/student/") ||
    pathname === "/api/student" ||
    pathname.startsWith("/api/student/") ||
    pathname.startsWith("/api/attempts") ||
    pathname === "/api/auth/verify-token"
  ) {
    return normalizedRole === "STUDENT" || normalizedRole === "ADMIN";
  }

  // Allow STUDENT to read single exam detail/snapshot needed by lobby & workspace
  if (/^\/api\/exams\/[^/]+(\/snapshot)?$/.test(pathname)) {
    return (
      normalizedRole === "STUDENT" ||
      normalizedRole === "PROCTOR" ||
      normalizedRole === "TEACHER" ||
      normalizedRole === "ADMIN"
    );
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

  // Moodle web service proxy (for administrative & proctor tasks)
  if (pathname.startsWith("/api/moodle-proxy")) {
    return (
      normalizedRole === "ADMIN" ||
      normalizedRole === "TEACHER" ||
      normalizedRole === "PROCTOR"
    );
  }

  // Exam list & schedule access (needed by ADMIN, TEACHER, and PROCTOR for live monitoring)
  if (pathname.startsWith("/api/exams")) {
    return (
      normalizedRole === "ADMIN" ||
      normalizedRole === "TEACHER" ||
      normalizedRole === "PROCTOR"
    );
  }

  // Management API routes (classes, students, questions, subjects, exam-cards, sync, upload)
  if (
    pathname.startsWith("/api/classes") ||
    pathname.startsWith("/api/students") ||
    pathname.startsWith("/api/questions") ||
    pathname.startsWith("/api/subjects") ||
    pathname.startsWith("/api/exam-cards") ||
    pathname.startsWith("/api/sync") ||
    pathname.startsWith("/api/upload")
  ) {
    return normalizedRole === "ADMIN" || normalizedRole === "TEACHER";
  }

  // Admin exclusive APIs
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    return normalizedRole === "ADMIN";
  }

  // Dashboard general / admin zone
  if (pathname.startsWith("/dashboard")) {
    if (normalizedRole === "ADMIN") return true;
    if (normalizedRole === "TEACHER") {
      // Teachers can access courses, exams, results, proctor
      return !pathname.startsWith("/dashboard/admin/settings");
    }
    if (normalizedRole === "PROCTOR") {
      return (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/proctor") ||
        pathname.startsWith("/dashboard/announcements") ||
        pathname.startsWith("/dashboard/results")
      );
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
