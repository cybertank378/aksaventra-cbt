import { describe, expect, it } from "vitest";
import { verifyStoredPasswordHash } from "@/libs/passwordVerifier";

describe("passwordVerifier (verifyStoredPasswordHash)", () => {
  const moodleSha512Hash =
    "$6$rounds=10000$FOHTMX68ljBLby/S$IKDZLTa.0Qd9XMQXEd7VbNbHVsYhssxkKkEodtzshrQ/XjDdUTTQaCNb7PEwf0BNcPp6oREamZXfiJoALX99R1";
  const argon2idHash =
    "$argon2id$v=19$m=65536,t=4,p=1$V2VXSnROTmdkRnRUYjFQZg$STjYNokJ8N0zmUx36cP3tPB3NZYQUDUO66rh/LplZrI";

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
