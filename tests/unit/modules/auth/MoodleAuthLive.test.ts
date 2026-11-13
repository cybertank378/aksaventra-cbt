import { describe, expect, it } from "vitest";
import { AuthRepository } from "@/modules/auth/infrastructure/AuthRepository";

describe("AuthRepository Moodle Authentication Integration", () => {
  it("authenticates admin credentials against live Moodle instance and returns ADMIN role", async () => {
    const repo = new AuthRepository();
    const result = await repo.verifyMoodleCredentials("admin", "Admin123!");

    expect(result).not.toBeNull();
    expect(result?.username).toBe("admin");
    expect(result?.role).toBe("ADMIN");
    expect(result?.moodleUserId).toBe(2);
    expect(result?.token).toBeDefined();
  });

  it("returns null when invalid credentials are provided", async () => {
    const repo = new AuthRepository();
    const result = await repo.verifyMoodleCredentials("admin", "WrongPassword123!");

    expect(result).toBeNull();
  });
});
