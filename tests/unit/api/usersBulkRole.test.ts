import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireRequestRole = vi.hoisted(() => vi.fn());
const mockUserFindMany = vi.hoisted(() => vi.fn());
const mockUserUpdateMany = vi.hoisted(() => vi.fn());
const mockPushStudentToMoodle = vi.hoisted(() => vi.fn());

vi.mock("@/security/serverAuth", () => ({
  requireRequestRole: mockRequireRequestRole,
}));

vi.mock("@/libs/prisma", () => ({
  prisma: {
    user: {
      findMany: mockUserFindMany,
      updateMany: mockUserUpdateMany,
    },
  },
}));

vi.mock("@/modules/sync/application/MoodleSyncService", () => ({
  moodleSyncService: {
    pushStudentToMoodle: mockPushStudentToMoodle,
  },
}));

import { PATCH } from "@/app/api/users/bulk-role/route";

describe("PATCH /api/users/bulk-role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRequestRole.mockResolvedValue({
      session: { userId: "admin-self", username: "admin", role: "ADMIN" },
      errorResponse: null,
    });
  });

  it("rejects PROCTOR bulk role update when roomCode is missing", async () => {
    const req = new NextRequest("http://localhost/api/users/bulk-role", {
      method: "PATCH",
      body: JSON.stringify({
        userIds: ["u-1", "u-2"],
        role: "PROCTOR",
      }),
    });

    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("ROOM_REQUIRED");
    expect(mockUserUpdateMany).not.toHaveBeenCalled();
  });

  it("updates selected users, protects primary admin, and pushes updated roles to Moodle", async () => {
    const now = new Date("2026-11-27T08:00:00.000Z");
    mockUserFindMany
      .mockResolvedValueOnce([
        {
          id: "admin-self",
          moodleUserId: 2,
          username: "admin",
          fullName: "Admin Fahdking",
          role: "ADMIN",
          className: null,
          roomCode: null,
          isActive: true,
        },
        {
          id: "u-guru-1",
          moodleUserId: 15,
          username: "197103092017081001",
          fullName: "Agus Wurjantoro mtk",
          role: "ADMIN",
          className: null,
          roomCode: null,
          isActive: true,
        },
        {
          id: "u-guru-2",
          moodleUserId: 16,
          username: "182818",
          fullName: "Akhmad Zulfikar bk",
          role: "ADMIN",
          className: null,
          roomCode: null,
          isActive: true,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "u-guru-1",
          moodleUserId: 15,
          username: "197103092017081001",
          fullName: "Agus Wurjantoro mtk",
          role: "TEACHER",
          className: null,
          roomCode: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "u-guru-2",
          moodleUserId: 16,
          username: "182818",
          fullName: "Akhmad Zulfikar bk",
          role: "TEACHER",
          className: null,
          roomCode: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);

    mockUserUpdateMany.mockResolvedValueOnce({ count: 2 });
    mockPushStudentToMoodle.mockResolvedValue({ synced: true, moodleId: 15 });

    const req = new NextRequest("http://localhost/api/users/bulk-role", {
      method: "PATCH",
      body: JSON.stringify({
        userIds: ["admin-self", "u-guru-1", "u-guru-2"],
        role: "TEACHER",
      }),
    });

    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.updatedCount).toBe(2);
    expect(json.data.skippedCount).toBe(1);
    expect(json.data.moodleSyncedCount).toBe(2);
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["u-guru-1", "u-guru-2"] } },
      data: {
        role: "TEACHER",
        roomCode: null,
        classGroupId: null,
        className: null,
      },
    });
    expect(mockPushStudentToMoodle).toHaveBeenCalledTimes(2);
    expect(mockPushStudentToMoodle).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "u-guru-1",
        role: "TEACHER",
      }),
    );
  });
});
