import { describe, expect, it } from "vitest";
import { verifyStoredPasswordHash } from "@/libs/passwordVerifier";

describe("passwordVerifier (verifyStoredPasswordHash)", () => {
  const moodleSha512Hash =
    "$6$rounds=10000$FOHTMX68ljBLby/S$IKDZLTa.0Qd9XMQXEd7VbNbHVsYhssxkKkEodtzshrQ/XjDdUTTQaCNb7PEwf0BNcPp6oREamZXfiJoALX99R1";
  const argon2idHash =
    "$argon2id$v=19$m=65536,t=4,p=1$V2VXSnROTmdkRnRUYjFQZg$STjYNokJ8N0zmUx36cP3tPB3NZYQUDUO66rh/LplZrI";
  const moodleBcryptSiswaHash =
    "$2y$10$xyXcMCoG7GErNliuy8T4c.JiPNP1VWlBrK5BCSYIvXsXbE.iVZUCC";
  const moodleBcryptAdminHash =
    "$2y$10$olIq9BeuHt7h58DHA6Rqzu4KUdYFaRIyzk2wsYMdlQY7qRwY7HO2O";

  it("verifies Moodle $6$ (SHA-512 crypt) hash and marks needsArgon2Upgrade = true", async () => {
    const result = await verifyStoredPasswordHash(
      moodleSha512Hash,
      "F4hdking001#",
    );
    expect(result.valid).toBe(true);
    expect(result.needsArgon2Upgrade).toBe(true);
  });

  it("rejects wrong password for Moodle $6$ hash", async () => {
    const result = await verifyStoredPasswordHash(
      moodleSha512Hash,
      "WrongPassword123!",
    );
    expect(result.valid).toBe(false);
    expect(result.needsArgon2Upgrade).toBe(false);
  });

  it("verifies Moodle $2y$ (PHP PASSWORD_DEFAULT Bcrypt) student and admin hashes and marks needsArgon2Upgrade = true", async () => {
    const resSiswa = await verifyStoredPasswordHash(
      moodleBcryptSiswaHash,
      "Siswa123*",
    );
    expect(resSiswa.valid).toBe(true);
    expect(resSiswa.needsArgon2Upgrade).toBe(true);

    const resAdmin = await verifyStoredPasswordHash(
      moodleBcryptAdminHash,
      "F4hdking001#",
    );
    expect(resAdmin.valid).toBe(true);
    expect(resAdmin.needsArgon2Upgrade).toBe(true);

    const resWrong = await verifyStoredPasswordHash(
      moodleBcryptSiswaHash,
      "WrongPass",
    );
    expect(resWrong.valid).toBe(false);
  });

  it("verifies Argon2id hash and marks needsArgon2Upgrade = false", async () => {
    const result = await verifyStoredPasswordHash(argon2idHash, "F4hdking001#");
    expect(result.valid).toBe(true);
    expect(result.needsArgon2Upgrade).toBe(false);
  });

  it("rejects wrong password for Argon2id hash", async () => {
    const result = await verifyStoredPasswordHash(
      argon2idHash,
      "WrongPassword123!",
    );
    expect(result.valid).toBe(false);
    expect(result.needsArgon2Upgrade).toBe(false);
  });
});
