import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { SyncService } from "@/modules/sync/application/service/SyncService";
import { HandleMoodleWebhookUseCase } from "@/modules/sync/application/usecases/HandleMoodleWebhookUseCase";
import { PullMoodleMasterDataUseCase } from "@/modules/sync/application/usecases/PullMoodleMasterDataUseCase";
import { PushEntityToMoodleUseCase } from "@/modules/sync/application/usecases/PushEntityToMoodleUseCase";
import type { SyncRepositoryInterface } from "@/modules/sync/domain/interfaces/SyncRepositoryInterface";
import { SyncController } from "@/modules/sync/infrastructure/SyncController";
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

function createMockRepo(): SyncRepositoryInterface {
  return {
    pullFromMoodle: vi.fn().mockResolvedValue({
      courses: [{ id: 2, name: "Biologi" }],
      classes: [],
      students: [],
      exams: [],
      questions: [],
    }),
    upsertCourses: vi.fn().mockResolvedValue(1),
    upsertClasses: vi.fn().mockResolvedValue(0),
    upsertStudents: vi.fn().mockResolvedValue(0),
    upsertExams: vi.fn().mockResolvedValue(0),
    upsertQuestions: vi.fn().mockResolvedValue(0),
    deleteEntity: vi.fn().mockResolvedValue(undefined),
    pushClassToMoodle: vi
      .fn()
      .mockResolvedValue({ synced: true, moodleId: 12 }),
    pushStudentToMoodle: vi
      .fn()
      .mockResolvedValue({ synced: true, moodleId: 34 }),
    pushSubjectToMoodle: vi
      .fn()
      .mockResolvedValue({ synced: true, moodleId: 56 }),
    pushExamToMoodle: vi.fn().mockResolvedValue({ synced: true, moodleId: 78 }),
    pushQuestionToMoodle: vi
      .fn()
      .mockResolvedValue({ synced: true, moodleId: 90 }),
    findLocalEntityForPush: vi
      .fn()
      .mockResolvedValue({ synced: true, moodleId: 99 }),
    pushPendingLocalToMoodle: vi.fn().mockResolvedValue(undefined),
  };
}

function createControllerWithRepo(repo: SyncRepositoryInterface) {
  const pullUseCase = new PullMoodleMasterDataUseCase(repo);
  const webhookUseCase = new HandleMoodleWebhookUseCase(repo, pullUseCase);
  const pushUseCase = new PushEntityToMoodleUseCase(repo);
  const service = new SyncService(
    pullUseCase,
    webhookUseCase,
    pushUseCase,
    undefined,
    repo,
  );
  return new SyncController(service);
}

describe("SyncController & Clean Architecture Sync UseCases", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("GET /api/sync status enforces ADMIN/TEACHER RBAC and returns 200 with SyncWorkerStatus shape", async () => {
    const controller = createControllerWithRepo(createMockRepo());

    const unauthRes = await controller.getStatus(
      new NextRequest("http://localhost/api/sync", { method: "GET" }),
    );
    expect(unauthRes.status).toBe(401);

    const studentRes = await controller.getStatus(
      await makeSignedRequest("http://localhost/api/sync", "GET", "STUDENT"),
    );
    expect(studentRes.status).toBe(403);

    const res = await controller.getStatus(
      await makeSignedRequest("http://localhost/api/sync", "GET", "ADMIN"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("intervalMs");
    expect(json.data).toHaveProperty("isSyncing", false);
  });

  it("POST /api/sync manageSync rejects invalid payload via Zod and supports pull/push", async () => {
    const repo = createMockRepo();
    const controller = createControllerWithRepo(repo);

    const studentRes = await controller.manageSync(
      await makeSignedRequest("http://localhost/api/sync", "POST", "STUDENT", {
        mode: "pull",
        entity: "course",
      }),
    );
    expect(studentRes.status).toBe(403);

    const invalidReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "ADMIN",
      { mode: "unknown" },
    );
    const invalidRes = await controller.manageSync(invalidReq);
    expect(invalidRes.status).toBe(422);

    const pullReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "TEACHER",
      { mode: "pull", entity: "course" },
    );
    const pullRes = await controller.manageSync(pullReq);
    const pullJson = await pullRes.json();
    expect(pullRes.status).toBe(200);
    expect(pullJson.data.counts.courses).toBe(1);

    const pushReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "ADMIN",
      { mode: "push", entity: "class", id: "cls-1" },
    );
    const pushRes = await controller.manageSync(pushReq);
    const pushJson = await pushRes.json();
    expect(pushRes.status).toBe(200);
    expect(pushJson.data).toEqual({ synced: true, moodleId: 99 });
    expect(repo.findLocalEntityForPush).toHaveBeenCalledWith("class", "cls-1");
  });

  it("POST /api/sync/moodle-webhook enforces X-Moodle-Webhook-Secret, timing-safe check, and fails closed in production", async () => {
    const repo = createMockRepo();
    const controller = createControllerWithRepo(repo);

    const unauthReq = new NextRequest(
      "http://localhost/api/sync/moodle-webhook",
      {
        method: "POST",
        headers: { "x-moodle-webhook-secret": "wrong-secret" },
        body: JSON.stringify({
          entity: "course",
          action: "created",
          objectId: 2,
        }),
      },
    );
    const unauthRes = await controller.handleWebhook(unauthReq);
    expect(unauthRes.status).toBe(401);

    const validReq = new NextRequest(
      "http://localhost/api/sync/moodle-webhook",
      {
        method: "POST",
        headers: { "x-moodle-webhook-secret": "aksaventra_sync_secret_2026" },
        body: JSON.stringify({
          entity: "course",
          action: "created",
          objectId: 2,
        }),
      },
    );
    const validRes = await controller.handleWebhook(validReq);
    const validJson = await validRes.json();
    expect(validRes.status).toBe(200);
    expect(validJson.success).toBe(true);
    expect(validJson.data.counts.courses).toBe(1);

    // Fail closed in production when MOODLE_WEBHOOK_SECRET is unset
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOODLE_WEBHOOK_SECRET", "");
    const prodUnconfiguredReq = new NextRequest(
      "http://localhost/api/sync/moodle-webhook",
      {
        method: "POST",
        headers: { "x-moodle-webhook-secret": "aksaventra_sync_secret_2026" },
        body: JSON.stringify({
          entity: "course",
          action: "created",
          objectId: 2,
        }),
      },
    );
    const prodRes = await controller.handleWebhook(prodUnconfiguredReq);
    expect(prodRes.status).toBe(500);
  });

  it("POST /api/sync mode=full pushes pending local entities and pulls all from Moodle", async () => {
    const repo = createMockRepo();
    const controller = createControllerWithRepo(repo);

    const fullReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "ADMIN",
      { mode: "full" },
    );
    const fullRes = await controller.manageSync(fullReq);
    const fullJson = await fullRes.json();

    expect(fullRes.status).toBe(200);
    expect(fullJson.success).toBe(true);
    expect(repo.pushPendingLocalToMoodle).toHaveBeenCalledTimes(1);
    expect(repo.pullFromMoodle).toHaveBeenCalledWith("pull_all");
  });

  it("POST /api/sync accepts entity=course for push and isolates section failures during pull_all", async () => {
    const repo = createMockRepo();
    repo.upsertExams = vi
      .fn()
      .mockRejectedValueOnce(new Error("Exam table unavailable"));
    const controller = createControllerWithRepo(repo);

    const pushCourseReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "ADMIN",
      { mode: "push", entity: "course", id: "sub-1" },
    );
    const pushCourseRes = await controller.manageSync(pushCourseReq);
    expect(pushCourseRes.status).toBe(200);
    expect(repo.findLocalEntityForPush).toHaveBeenCalledWith("course", "sub-1");

    const pullAllReq = await makeSignedRequest(
      "http://localhost/api/sync",
      "POST",
      "ADMIN",
      { mode: "pull", entity: "all" },
    );
    const pullAllRes = await controller.manageSync(pullAllReq);
    const pullAllJson = await pullAllRes.json();
    expect(pullAllRes.status).toBe(207);
    expect(pullAllJson.data.counts.courses).toBe(1);
    expect(pullAllJson.data.errors).toContain("exams: Exam table unavailable");
  });
});
