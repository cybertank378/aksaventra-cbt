import { createHash, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";

const CRYPT_BASE64 =
  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function b64From24bit(b2: number, b1: number, b0: number, n: number): string {
  let w = ((b2 << 16) & 0xffffff) | ((b1 << 8) & 0xffff) | (b0 & 0xff);
  let out = "";
  for (let i = 0; i < n; i++) {
    out += CRYPT_BASE64[w & 0x3f];
    w >>>= 6;
  }
  return out;
}

/**
 * Computes standard glibc / PHP crypt(3) SHA-512 ($6$) digest using node:crypto.
 * Used to verify Moodle synced password hashes ($6$rounds=...) and auto-upgrade them to Argon2id.
 */
export function computeSha512Crypt(
  password: string,
  salt: string,
  rounds = 5000,
): string {
  const keyBuf = Buffer.from(password, "utf8");
  const saltBuf = Buffer.from(salt.slice(0, 16), "utf8");
  const keyLen = keyBuf.length;
  const saltLen = saltBuf.length;

  // Steps 4-8: Digest B
  const ctxB = createHash("sha512");
  ctxB.update(keyBuf);
  ctxB.update(saltBuf);
  ctxB.update(keyBuf);
  const altResult = ctxB.digest();

  // Steps 1-3, 9-12: Digest A
  const ctxA = createHash("sha512");
  ctxA.update(keyBuf);
  ctxA.update(saltBuf);

  let cnt = keyLen;
  while (cnt > 64) {
    ctxA.update(altResult);
    cnt -= 64;
  }
  ctxA.update(altResult.subarray(0, cnt));

  for (let bits = keyLen; bits > 0; bits >>>= 1) {
    if ((bits & 1) !== 0) {
      ctxA.update(altResult);
    } else {
      ctxA.update(keyBuf);
    }
  }
  let tempResult = ctxA.digest();

  // Steps 13-15: Byte sequence P
  const ctxDP = createHash("sha512");
  for (let i = 0; i < keyLen; i++) {
    ctxDP.update(keyBuf);
  }
  const dpResult = ctxDP.digest();
  const pBytes = Buffer.alloc(keyLen);
  let pOffset = 0;
  while (pOffset + 64 <= keyLen) {
    dpResult.copy(pBytes, pOffset, 0, 64);
    pOffset += 64;
  }
  if (pOffset < keyLen) {
    dpResult.copy(pBytes, pOffset, 0, keyLen - pOffset);
  }

  // Steps 16-19: Byte sequence S
  const ctxDS = createHash("sha512");
  const dsIterations = 16 + tempResult[0];
  for (let i = 0; i < dsIterations; i++) {
    ctxDS.update(saltBuf);
  }
  const dsResult = ctxDS.digest();
  const sBytes = Buffer.alloc(saltLen);
  let sOffset = 0;
  while (sOffset + 64 <= saltLen) {
    dsResult.copy(sBytes, sOffset, 0, 64);
    sOffset += 64;
  }
  if (sOffset < saltLen) {
    dsResult.copy(sBytes, sOffset, 0, saltLen - sOffset);
  }

  // Step 21: Rounds loop
  const effectiveRounds = Math.max(1000, Math.min(999999999, rounds));
  for (let i = 0; i < effectiveRounds; i++) {
    const ctxC = createHash("sha512");
    if ((i & 1) !== 0) {
      ctxC.update(pBytes);
    } else {
      ctxC.update(tempResult);
    }
    if (i % 3 !== 0) {
      ctxC.update(sBytes);
    }
    if (i % 7 !== 0) {
      ctxC.update(pBytes);
    }
    if ((i & 1) !== 0) {
      ctxC.update(tempResult);
    } else {
      ctxC.update(pBytes);
    }
    tempResult = ctxC.digest();
  }

  const r = tempResult;
  const encoded =
    b64From24bit(r[0], r[21], r[42], 4) +
    b64From24bit(r[22], r[43], r[1], 4) +
    b64From24bit(r[44], r[2], r[23], 4) +
    b64From24bit(r[3], r[24], r[45], 4) +
    b64From24bit(r[25], r[46], r[4], 4) +
    b64From24bit(r[47], r[5], r[26], 4) +
    b64From24bit(r[6], r[27], r[48], 4) +
    b64From24bit(r[28], r[49], r[7], 4) +
    b64From24bit(r[50], r[8], r[29], 4) +
    b64From24bit(r[9], r[30], r[51], 4) +
    b64From24bit(r[31], r[52], r[10], 4) +
    b64From24bit(r[53], r[11], r[32], 4) +
    b64From24bit(r[12], r[33], r[54], 4) +
    b64From24bit(r[34], r[55], r[13], 4) +
    b64From24bit(r[56], r[14], r[35], 4) +
    b64From24bit(r[15], r[36], r[57], 4) +
    b64From24bit(r[37], r[58], r[16], 4) +
    b64From24bit(r[59], r[17], r[38], 4) +
    b64From24bit(r[18], r[39], r[60], 4) +
    b64From24bit(r[40], r[61], r[19], 4) +
    b64From24bit(r[62], r[20], r[41], 4) +
    b64From24bit(0, 0, r[63], 2);

  return encoded;
}

export function verifySha512CryptHash(
  storedHash: string,
  plainTextPassword: string,
): boolean {
  const match = storedHash.match(
    /^\$6\$(?:rounds=(\d+)\$)?([^$]{1,16})\$([./0-9A-Za-z]{86})$/,
  );
  if (!match) {
    return false;
  }
  const rounds = match[1] ? Number.parseInt(match[1], 10) : 5000;
  const salt = match[2];
  const expectedDigest = match[3];
  const computedDigest = computeSha512Crypt(plainTextPassword, salt, rounds);

  const a = Buffer.from(computedDigest, "utf8");
  const b = Buffer.from(expectedDigest, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verifies a password against either an Argon2 hash ($argon2id$ / $argon2i$)
 * or a Moodle SHA-512 crypt hash ($6$rounds=...).
 */
export async function verifyStoredPasswordHash(
  storedHash: string | null | undefined,
  plainTextPassword: string,
): Promise<{ valid: boolean; needsArgon2Upgrade: boolean }> {
  if (!storedHash) {
    return { valid: false, needsArgon2Upgrade: false };
  }

  if (storedHash.startsWith("$argon2")) {
    try {
      const valid = await argon2.verify(storedHash, plainTextPassword);
      return { valid, needsArgon2Upgrade: false };
    } catch {
      return { valid: false, needsArgon2Upgrade: false };
    }
  }

  if (storedHash.startsWith("$6$")) {
    const valid = verifySha512CryptHash(storedHash, plainTextPassword);
    return { valid, needsArgon2Upgrade: valid };
  }

  return { valid: false, needsArgon2Upgrade: false };
}
