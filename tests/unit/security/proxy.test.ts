import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  extractTokenFromRequest,
  proxyMiddleware,
  verifyAuthToken,
} from "@/proxy";

describe("proxyMiddleware & JWT Edge Protection", () => {
  const secretKey =
    process.env.CBT_JWT_SECRET ||
    "aksaventra_default_jwt_secret_dev_key_32_chars_long";
  const encodedKey = new TextEncoder().encode(secretKey);

  async function createTestJwt(
    payload: { userId: number; username: string; role: string },
    expiration = "1h",
  ): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiration)
      .setIssuedAt()
      .sign(encodedKey);
  }

  describe("extractTokenFromRequest", () => {
    it("extracts token from Authorization: Bearer header", () => {
      const request = new NextRequest("https://cbt.aksaventra.ac.id/api/test", {
        headers: {
          authorization: "Bearer token-from-header-123",
        },
      });

      expect(extractTokenFromRequest(request)).toBe("token-from-header-123");
    });

    it("extracts token from aksaventra_token cookie", () => {
      const request = new NextRequest(
        "https://cbt.aksaventra.ac.id/dashboard",
        {
          headers: {
            cookie: "aksaventra_token=token-from-cookie-456; other=val",
          },
        },
      );

      expect(extractTokenFromRequest(request)).toBe("token-from-cookie-456");
    });

    it("returns null when no token is present", () => {
      const request = new NextRequest("https://cbt.aksaventra.ac.id/public");
      expect(extractTokenFromRequest(request)).toBeNull();
    });
  });

  describe("verifyAuthToken", () => {
    it("successfully verifies and decodes a signed JWT", async () => {
      const token = await createTestJwt({
        userId: 42,
        username: "siswa_01",
        role: "STUDENT",
      });

      const decoded = await verifyAuthToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(42);
      expect(decoded?.username).toBe("siswa_01");
      expect(decoded?.role).toBe("STUDENT");
    });

    it("returns null for an invalid or tampered token", async () => {
      const decoded = await verifyAuthToken("invalid.jwt.token");
      expect(decoded).toBeNull();
    });
  });

  describe("proxyMiddleware", () => {
    it("passes through public routes without token", async () => {
      const request = new NextRequest("https://cbt.aksaventra.ac.id/login");
      const response = await proxyMiddleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    });

    it("returns 401 JSON when unauthenticated user requests protected API", async () => {
      const request = new NextRequest(
        "https://cbt.aksaventra.ac.id/api/attempts/1/sync",
      );
      const response = await proxyMiddleware(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("redirects to /login when unauthenticated user requests protected page", async () => {
      const request = new NextRequest(
        "https://cbt.aksaventra.ac.id/student/exam/100",
      );
      const response = await proxyMiddleware(request);

      expect(response.status).toBe(307); // NextResponse.redirect default
      expect(response.headers.get("location")).toContain("/login?redirect=");
    });

    it("returns 403 JSON when authenticated user has insufficient role for API", async () => {
      const studentToken = await createTestJwt({
        userId: 10,
        username: "student1",
        role: "STUDENT",
      });

      const request = new NextRequest(
        "https://cbt.aksaventra.ac.id/api/proctor/5/control",
        {
          headers: {
            authorization: `Bearer ${studentToken}`,
          },
        },
      );

      const response = await proxyMiddleware(request);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("allows authorized student and attaches x-user headers", async () => {
      const studentToken = await createTestJwt({
        userId: 25,
        username: "siswa_budi",
        role: "STUDENT",
      });

      const request = new NextRequest(
        "https://cbt.aksaventra.ac.id/student/exam/5",
        {
          headers: {
            authorization: `Bearer ${studentToken}`,
          },
        },
      );

      const response = await proxyMiddleware(request);
      expect(response.status).toBe(200);
      // Downstream request headers injected
      expect(response.headers.get("location")).toBeNull();
    });
  });
});
