import type { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ExamRepository } from "@/modules/exams/infrastructure/ExamRepository";
import { SubjectsService } from "@/modules/subjects/application/service/SubjectsService";
import type { SubjectsRepositoryInterface } from "@/modules/subjects/domain/interfaces/SubjectsRepositoryInterface";
import { SubjectsController } from "@/modules/subjects/infrastructure/SubjectsController";
import { getEncodedJwtSecret } from "@/security/jwtConfig";

async function makeSignedRequest(
  url: string,
  method: string,
  role: "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT",
  body?: unknown,
): Promise<NextRequest> {
  const token = await new SignJWT({
    userId: `user-${role.toLowerCase()}`,
    username: role.toLowerCase(),
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

function createSubjectsController() {
  const repo: SubjectsRepositoryInterface = {
    getAllNames: vi.fn().mockResolvedValue(["Matematika"]),
    getAllDetailed: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: "sub-1",
      name: "Matematika",
      shortName: "MTK",
      isVisible: true,
      questionCount: 0,
      examCount: 0,
      gradeLevels: [],
      createdAt: "2026-11-27T00:00:00Z",
      updatedAt: "2026-11-27T00:00:00Z",
    }),
    update: vi.fn().mockImplementation(async (id, data) => ({
      id,
      name: data.name ?? "Matematika",
      shortName: data.shortName ?? "MTK",
      isVisible: data.isVisible ?? true,
      questionCount: 0,
      examCount: 0,
      gradeLevels: [],
      createdAt: "2026-11-27T00:00:00Z",
      updatedAt: "2026-11-27T00:00:00Z",
    })),
    delete: vi.fn().mockResolvedValue(true),
  };

  return {
    repo,
    controller: new SubjectsController(new SubjectsService(repo)),
  };
}

describe("Subjects isVisible RBAC & Student Filtering", () => {
  it("allows both ADMIN and TEACHER to toggle isVisible, while blocking PROCTOR and STUDENT", async () => {
    const { repo, controller } = createSubjectsController();

    const adminReq = await makeSignedRequest(
      "http://localhost/api/subjects/sub-1",
      "PATCH",
      "ADMIN",
      { isVisible: false },
    );
    const adminRes = await controller.updateSubject("sub-1", adminReq);
    const adminJson = await adminRes.json();
    expect(adminRes.status).toBe(200);
    expect(adminJson.data.isVisible).toBe(false);

    const teacherReq = await makeSignedRequest(
      "http://localhost/api/subjects/sub-1",
      "PATCH",
      "TEACHER",
      { isVisible: true },
    );
    const teacherRes = await controller.updateSubject("sub-1", teacherReq);
    const teacherJson = await teacherRes.json();
    expect(teacherRes.status).toBe(200);
    expect(teacherJson.data.isVisible).toBe(true);
    expect(repo.update).toHaveBeenCalledTimes(2);

    const proctorReq = await makeSignedRequest(
      "http://localhost/api/subjects/sub-1",
      "PATCH",
      "PROCTOR",
      { isVisible: false },
    );
    const proctorRes = await controller.updateSubject("sub-1", proctorReq);
    expect(proctorRes.status).toBe(403);

    const studentReq = await makeSignedRequest(
      "http://localhost/api/subjects/sub-1",
      "PATCH",
      "STUDENT",
      { isVisible: false },
    );
    const studentRes = await controller.updateSubject("sub-1", studentReq);
    expect(studentRes.status).toBe(403);
    expect(repo.update).toHaveBeenCalledTimes(2);
  });

  it("ExamRepository.listForStudent hides exams from hidden courses unless student already has an attempt", async () => {
    const now = new Date();
    const mockDb = {
      exam: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ex-visible",
            moodleCbtId: 1,
            title: "UTS Matematika",
            courseName: "Matematika",
            durationSeconds: 3600,
            maxStrikes: 3,
            sebRequired: false,
            questionsJson: [],
            timeOpen: new Date(now.getTime() - 60_000),
            timeClose: new Date(now.getTime() + 3600_000),
            attempts: [],
          },
          {
            id: "ex-hidden",
            moodleCbtId: 2,
            title: "Draft UAS IPA",
            courseName: "IPA Terpadu",
            durationSeconds: 3600,
            maxStrikes: 3,
            sebRequired: false,
            questionsJson: [],
            timeOpen: new Date(now.getTime() - 60_000),
            timeClose: new Date(now.getTime() + 3600_000),
            attempts: [],
          },
          {
            id: "ex-hidden-attempted",
            moodleCbtId: 3,
            title: "Remedial IPA",
            courseName: "IPA Terpadu",
            durationSeconds: 3600,
            maxStrikes: 3,
            sebRequired: false,
            questionsJson: [],
            timeOpen: new Date(now.getTime() - 60_000),
            timeClose: new Date(now.getTime() + 3600_000),
            attempts: [
              {
                id: "att-1",
                status: "SUBMITTED",
                finalScore: 85,
                startedAt: now,
                finishedAt: now,
              },
            ],
          },
        ]),
      },
      subject: {
        findMany: vi.fn().mockResolvedValue([{ name: "IPA Terpadu" }]),
      },
    };

    const repo = new ExamRepository(mockDb as unknown as PrismaClient);
    const list = await repo.listForStudent("student-1");

    expect(list.map((e) => e.id)).toEqual([
      "ex-visible",
      "ex-hidden-attempted",
    ]);
  });
});
