import { describe, expect, it } from "vitest";
import {
  getDefaultRedirectForRole,
  isPublicRoute,
  isRouteAuthorized,
} from "@/security/rbacConfig";
import { getAccessibleMenuItems } from "@/security/sidebarMenu";

describe("rbacConfig & sidebarMenu", () => {
  describe("isPublicRoute", () => {
    it("identifies public pages and endpoints correctly", () => {
      expect(isPublicRoute("/")).toBe(true);
      expect(isPublicRoute("/login")).toBe(true);
      expect(isPublicRoute("/api/auth/login")).toBe(true);
      expect(isPublicRoute("/api/health")).toBe(true);
      expect(isPublicRoute("/favicon.ico")).toBe(true);
    });

    it("identifies protected routes as non-public", () => {
      expect(isPublicRoute("/student/exam/1")).toBe(false);
      expect(isPublicRoute("/student/lobby/1")).toBe(false);
      expect(isPublicRoute("/dashboard")).toBe(false);
      expect(isPublicRoute("/dashboard/proctor")).toBe(false);
      expect(isPublicRoute("/api/attempts/1/sync")).toBe(false);
    });
  });

  describe("isRouteAuthorized", () => {
    it("authorizes public routes regardless of role", () => {
      expect(isRouteAuthorized(null, "/login")).toBe(true);
      expect(isRouteAuthorized(undefined, "/api/health")).toBe(true);
    });

    it("denies protected routes when role is empty", () => {
      expect(isRouteAuthorized(null, "/student/lobby")).toBe(false);
      expect(isRouteAuthorized(undefined, "/dashboard")).toBe(false);
    });

    it("allows STUDENT to access student pages and attempts APIs", () => {
      expect(isRouteAuthorized("STUDENT", "/student/lobby/10")).toBe(true);
      expect(isRouteAuthorized("STUDENT", "/student/exam/55")).toBe(true);
      expect(isRouteAuthorized("STUDENT", "/api/attempts/55/sync")).toBe(true);

      // Student cannot access proctor or dashboard
      expect(isRouteAuthorized("STUDENT", "/dashboard")).toBe(false);
      expect(isRouteAuthorized("STUDENT", "/dashboard/proctor")).toBe(false);
    });

    it("allows PROCTOR to access command center but not system settings", () => {
      expect(isRouteAuthorized("PROCTOR", "/dashboard/proctor/123")).toBe(true);
      expect(isRouteAuthorized("PROCTOR", "/api/proctor/123/control")).toBe(
        true,
      );

      expect(isRouteAuthorized("PROCTOR", "/student/exam/1")).toBe(false);
      expect(isRouteAuthorized("PROCTOR", "/dashboard/admin/settings")).toBe(
        false,
      );
    });

    it("allows ADMIN to access all routes", () => {
      expect(isRouteAuthorized("ADMIN", "/dashboard")).toBe(true);
      expect(isRouteAuthorized("ADMIN", "/dashboard/proctor")).toBe(true);
      expect(isRouteAuthorized("ADMIN", "/dashboard/admin/settings")).toBe(
        true,
      );
      expect(isRouteAuthorized("ADMIN", "/student/lobby/1")).toBe(true);
    });
  });

  describe("getDefaultRedirectForRole", () => {
    it("redirects to appropriate landing pages", () => {
      expect(getDefaultRedirectForRole("STUDENT")).toBe("/student/lobby");
      expect(getDefaultRedirectForRole("PROCTOR")).toBe("/dashboard/proctor");
      expect(getDefaultRedirectForRole("TEACHER")).toBe("/dashboard");
      expect(getDefaultRedirectForRole("ADMIN")).toBe("/dashboard");
      expect(getDefaultRedirectForRole(null)).toBe("/login");
    });
  });

  describe("getAccessibleMenuItems", () => {
    it("filters sidebar items for PROCTOR", () => {
      const items = getAccessibleMenuItems("PROCTOR");
      const paths = items.map((i) => i.path);

      expect(paths).toContain("/dashboard/proctor");
      expect(paths).not.toContain("/dashboard/admin/settings");
    });

    it("includes admin settings only for ADMIN", () => {
      const adminItems = getAccessibleMenuItems("ADMIN");
      const teacherItems = getAccessibleMenuItems("TEACHER");

      expect(
        adminItems.some((i) => i.path === "/dashboard/admin/settings"),
      ).toBe(true);
      expect(
        teacherItems.some((i) => i.path === "/dashboard/admin/settings"),
      ).toBe(false);
    });
  });
});
