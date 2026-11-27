import { createHash } from "node:crypto";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { Result as BaseResult } from "@/core/base/Result";
import { Result as DomainResult } from "@/core/domain/Result";
import { callMoodleApi } from "@/libs/moodleClient";
import { verifyStoredPasswordHash } from "@/libs/passwordVerifier";
import { escapeXml, sanitizeSvg } from "@/libs/svgSanitizer";
import type { AnnouncementsService } from "@/modules/announcements/application/service/AnnouncementsService";
import { AnnouncementsController } from "@/modules/announcements/infrastructure/AnnouncementsController";
import type { ClassesService } from "@/modules/classes/application/service/ClassesService";
import { ClassesController } from "@/modules/classes/infrastructure/ClassesController";
import type { ExamCardsService } from "@/modules/exam-cards/application/service/ExamCardsService";
import { ExamCardsController } from "@/modules/exam-cards/infrastructure/ExamCardsController";
import type { ExamService } from "@/modules/exams/application/service/ExamService";
import { ExamController } from "@/modules/exams/infrastructure/ExamController";
import type { QuestionsService } from "@/modules/questions/application/service/QuestionsService";
import { QuestionsController } from "@/modules/questions/infrastructure/QuestionsController";
import { RecapitulationController } from "@/modules/recapitulation/infrastructure/RecapitulationController";
import { getEncodedJwtSecret } from "@/security/jwtConfig";

async function makeSignedRequest(
  url: string,
  method: string,
  role: "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT",
  body?: unknown,
  username?: string,
): Promise<NextRequest> {
  const token = await new SignJWT({
    userId: `user-${role.toLowerCase()}`,
    username: username ?? role.toLowerCase(),
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getEncodedJwtSecret());

  return new NextRequest(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

describe("ISO 27001 & OWASP Security Remediation (#118)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Server-side API RBAC (Annex A.5.15 / OWASP A01)", () => {
    it("AnnouncementsController blocks STUDENT from creating/deleting and derives author from verified JWT", async () => {
      const mockService = {
        getAnnouncements: vi.fn().mockResolvedValue(DomainResult.ok([])),
        createAnnouncement: vi
          .fn()
          .mockResolvedValue(
            DomainResult.ok({ id: "ann-1", title: "Info", content: "Halo" }),
          ),
        deleteAnnouncement: vi
          .fn()
          .mockResolvedValue(DomainResult.ok({ deleted: true })),
      } as unknown as AnnouncementsService;

      const controller = new AnnouncementsController(mockService);

      // Unauthenticated GET -> 401
      const unauthGet = await controller.getAnnouncements(
        new NextRequest("http://localhost/api/announcements"),
      );
      expect(unauthGet.status).toBe(401);

      // Authenticated STUDENT GET -> 200
      const studentGet = await controller.getAnnouncements(
        await makeSignedRequest(
          "http://localhost/api/announcements",
          "GET",
          "STUDENT",
        ),
      );
      expect(studentGet.status).toBe(200);

      // Authenticated STUDENT POST -> 403
      const studentPost = await controller.createAnnouncement(
        await makeSignedRequest(
          "http://localhost/api/announcements",
          "POST",
          "STUDENT",
          { title: "Fake", content: "Hacked" },
        ),
      );
      expect(studentPost.status).toBe(403);
      expect(mockService.createAnnouncement).not.toHaveBeenCalled();

      // Authenticated PROCTOR POST -> 201 and ignores spoofed x-user-name header
      const proctorToken = await new SignJWT({
        userId: "user-proctor",
        username: "pengawas_ruang_1",
        role: "PROCTOR",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getEncodedJwtSecret());

      const proctorReq = new NextRequest("http://localhost/api/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${proctorToken}`,
          "Content-Type": "application/json",
          "x-user-name": "spoofed_admin",
        },
        body: JSON.stringify({ title: "Perhatian", content: "Waktu 10 menit" }),
      });

      const proctorPost = await controller.createAnnouncement(proctorReq);
      expect(proctorPost.status).toBe(201);
      expect(mockService.createAnnouncement).toHaveBeenCalledWith(
        { title: "Perhatian", content: "Waktu 10 menit" },
        "pengawas_ruang_1",
      );
    });

    it("ExamController fails closed on spoofed role headers and enforces ADMIN/TEACHER on mutations", async () => {
      const mockService = {
        listExams: vi.fn().mockResolvedValue(BaseResult.ok([])),
        getExamById: vi.fn().mockResolvedValue(
          BaseResult.ok({
            toClientSnapshotDTO: () => ({ id: "exam-1", title: "UTS" }),
          }),
        ),
        getSnapshot: vi.fn().mockResolvedValue(BaseResult.ok({ id: "exam-1" })),
        deleteExam: vi.fn().mockResolvedValue(BaseResult.ok({ deleted: true })),
      } as unknown as ExamService;

      const controller = new ExamController(mockService);

      // Spoofed x-user-role without valid JWT MUST fail closed (401)
      const spoofedDelete = await controller.deleteExam(
        "exam-1",
        new NextRequest("http://localhost/api/exams/exam-1", {
          method: "DELETE",
          headers: { "x-user-role": "ADMIN" },
        }),
      );
      expect(spoofedDelete.status).toBe(401);

      // Unauthenticated GET /api/exams/[id] and snapshot MUST fail closed (401)
      const unauthGetById = await controller.getById(
        "exam-1",
        new NextRequest("http://localhost/api/exams/exam-1"),
      );
      expect(unauthGetById.status).toBe(401);

      const unauthSnapshot = await controller.getSnapshot(
        "exam-1",
        new NextRequest("http://localhost/api/exams/exam-1/snapshot"),
      );
      expect(unauthSnapshot.status).toBe(401);

      // PROCTOR cannot delete exams (403)
      const proctorDelete = await controller.deleteExam(
        "exam-1",
        await makeSignedRequest(
          "http://localhost/api/exams/exam-1",
          "DELETE",
          "PROCTOR",
        ),
      );
      expect(proctorDelete.status).toBe(403);
      expect(mockService.deleteExam).not.toHaveBeenCalled();

      // ADMIN can delete exams (200)
      const adminDelete = await controller.deleteExam(
        "exam-1",
        await makeSignedRequest(
          "http://localhost/api/exams/exam-1",
          "DELETE",
          "ADMIN",
        ),
      );
      expect(adminDelete.status).toBe(200);
      expect(mockService.deleteExam).toHaveBeenCalledWith("exam-1");
    });

    it("ClassesController, QuestionsController, ExamCardsController, and RecapitulationController reject STUDENT (403) and unauthenticated (401)", async () => {
      const classesController = new ClassesController(
        {} as unknown as ClassesService,
      );
      const questionsController = new QuestionsController(
        {} as unknown as QuestionsService,
      );
      const examCardsController = new ExamCardsController(
        {} as unknown as ExamCardsService,
      );
      const recapController = new RecapitulationController();

      expect(
        (
          await classesController.getAllClasses(
            new NextRequest("http://localhost/api/classes"),
          )
        ).status,
      ).toBe(401);
      expect(
        (
          await classesController.getAllClasses(
            await makeSignedRequest(
              "http://localhost/api/classes",
              "GET",
              "STUDENT",
            ),
          )
        ).status,
      ).toBe(403);

      expect(
        (
          await questionsController.getQuestions(
            await makeSignedRequest(
              "http://localhost/api/questions",
              "GET",
              "STUDENT",
            ),
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await questionsController.deleteQuestion(
            "q-1",
            await makeSignedRequest(
              "http://localhost/api/questions/q-1",
              "DELETE",
              "PROCTOR",
            ),
          )
        ).status,
      ).toBe(403);

      expect(
        (
          await examCardsController.getCards(
            await makeSignedRequest(
              "http://localhost/api/exam-cards",
              "GET",
              "STUDENT",
            ),
          )
        ).status,
      ).toBe(403);

      expect(
        (
          await recapController.getRecapitulation(
            await makeSignedRequest(
              "http://localhost/api/exams/ex-1/recapitulation",
              "GET",
              "STUDENT",
            ),
            "ex-1",
          )
        ).status,
      ).toBe(403);
    });
  });

  describe("Fail-closed Moodle secret in production (Annex A.8.24 / OWASP A02)", () => {
    it("throws when MOODLE_WS_TOKEN is missing in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("MOODLE_WS_TOKEN", "");

      await expect(
        callMoodleApi("mod_cbt_sync_master_data", { action: "pull_all" }),
      ).rejects.toThrow(/MOODLE_WS_TOKEN wajib dikonfigurasi/);
    });
  });

  describe("Legacy MD5 password verification gating (Annex A.8.24 / OWASP A02)", () => {
    it("rejects unsalted MD5 hashes by default and permits migration only when explicitly enabled", async () => {
      const legacyMd5 = createHash("md5")
        .update("Siswa@2026", "utf8")
        .digest("hex");

      vi.stubEnv("ALLOW_LEGACY_MD5_MIGRATION", "");
      const blocked = await verifyStoredPasswordHash(legacyMd5, "Siswa@2026");
      expect(blocked).toEqual({ valid: false, needsArgon2Upgrade: false });

      vi.stubEnv("ALLOW_LEGACY_MD5_MIGRATION", "true");
      const allowed = await verifyStoredPasswordHash(legacyMd5, "Siswa@2026");
      expect(allowed).toEqual({ valid: true, needsArgon2Upgrade: true });
    });
  });

  describe("SVG XSS protection for MathDiagramModal (Annex A.8.28 / OWASP A03)", () => {
    it("escapes XML special characters and strips script/event handlers from SVG output", () => {
      const maliciousLabel = '</text><script>alert("xss")</script><text>';
      const escaped = escapeXml(maliciousLabel);
      expect(escaped).not.toContain("<script>");
      expect(escaped).toContain("&lt;script&gt;");

      const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><text x="10" y="20">${escaped}</text></svg>`;
      const cleaned = sanitizeSvg(rawSvg);
      expect(cleaned).not.toContain("<script");
      expect(cleaned).not.toContain("onload");
      expect(cleaned).toContain("<text");
    });
  });
});
