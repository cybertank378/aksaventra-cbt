import { createHash, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";

const CRYPT_BASE64 =
  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const BCRYPT_BASE64 =
  "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function b64From24bit(b2: number, b1: number, b0: number, n: number): string {
  let w = ((b2 << 16) & 0xffffff) | ((b1 << 8) & 0xffff) | (b0 & 0xff);
  let out = "";
  for (let i = 0; i < n; i++) {
    out += CRYPT_BASE64[w & 0x3f];
    w >>>= 6;
  }
  return out;
}

/* ============================================================================
 * 1. BCRYPT ($2y$, $2a$, $2b$) VERIFIER (Moodle standard PASSWORD_DEFAULT)
 * ============================================================================
 * Blowfish initial P-array (18 words) and 4 S-boxes (1024 words) are the first
 * 1042 32-bit words (4168 bytes) of the fractional part of Pi.
 */
let BLOWFISH_INIT_P: Uint32Array | null = null;
let BLOWFISH_INIT_S: Uint32Array | null = null;

function ensureBlowfishInitTables(): { p: Uint32Array; s: Uint32Array } {
  if (BLOWFISH_INIT_P && BLOWFISH_INIT_S) {
    return { p: BLOWFISH_INIT_P, s: BLOWFISH_INIT_S };
  }

  const totalWords = 18 + 1024; // 1042 words = 4168 bytes
  const guardBytes = 16;
  const totalBytes = totalWords * 4 + guardBytes;
  const zero = BigInt(0);
  const one = BigInt(1);
  const two = BigInt(2);
  const three = BigInt(3);
  const four = BigInt(4);
  const five = BigInt(5);
  const sixteen = BigInt(16);
  const recip239 = BigInt(239);
  const mask32 = BigInt("0xffffffff");
  const scale = one << BigInt(totalBytes * 8);

  const arctanRecip = (recip: bigint): bigint => {
    const r2 = recip * recip;
    let term = scale / recip;
    let sum = term;
    let k = one;
    let subtract = true;
    while (term > zero) {
      term /= r2;
      k += two;
      const step = term / k;
      if (step === zero) break;
      sum = subtract ? sum - step : sum + step;
      subtract = !subtract;
    }
    return sum;
  };

  // Machin's formula: pi - 3 = 16 * arctan(1/5) - 4 * arctan(1/239) - 3
  const piFrac =
    sixteen * arctanRecip(five) - four * arctanRecip(recip239) - three * scale;

  const p = new Uint32Array(18);
  const s = new Uint32Array(1024);

  for (let i = 0; i < totalWords; i++) {
    const shiftBits = BigInt((totalBytes - 4 - i * 4) * 8);
    const word = Number((piFrac >> shiftBits) & mask32) >>> 0;
    if (i < 18) {
      p[i] = word;
    } else {
      s[i - 18] = word;
    }
  }

  BLOWFISH_INIT_P = p;
  BLOWFISH_INIT_S = s;
  return { p, s };
}

function decodeBcryptBase64(str: string, maxBytes: number): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < str.length && out.length < maxBytes) {
    const c1 = BCRYPT_BASE64.indexOf(str[i++]);
    const c2 = i < str.length ? BCRYPT_BASE64.indexOf(str[i++]) : -1;
    if (c1 < 0 || c2 < 0) break;
    out.push(((c1 << 2) | ((c2 & 0x30) >> 4)) & 0xff);
    if (out.length >= maxBytes || i >= str.length) break;

    const c3 = BCRYPT_BASE64.indexOf(str[i++]);
    if (c3 < 0) break;
    out.push((((c2 & 0x0f) << 4) | ((c3 & 0x3c) >> 2)) & 0xff);
    if (out.length >= maxBytes || i >= str.length) break;

    const c4 = BCRYPT_BASE64.indexOf(str[i++]);
    if (c4 < 0) break;
    out.push((((c3 & 0x03) << 6) | c4) & 0xff);
  }
  return new Uint8Array(out);
}

function encodeBcryptBase64(bytes: Uint8Array, len: number): string {
  let out = "";
  let i = 0;
  while (i < len) {
    const b1 = bytes[i++] & 0xff;
    out += BCRYPT_BASE64[b1 >> 2];
    if (i >= len) {
      out += BCRYPT_BASE64[(b1 & 0x03) << 4];
      break;
    }
    const b2 = bytes[i++] & 0xff;
    out += BCRYPT_BASE64[((b1 & 0x03) << 4) | (b2 >> 4)];
    if (i >= len) {
      out += BCRYPT_BASE64[(b2 & 0x0f) << 2];
      break;
    }
    const b3 = bytes[i++] & 0xff;
    out += BCRYPT_BASE64[((b2 & 0x0f) << 2) | (b3 >> 6)];
    out += BCRYPT_BASE64[b3 & 0x3f];
  }
  return out;
}

function blowfishEncipher(
  lr: Uint32Array,
  off: number,
  P: Uint32Array,
  S: Uint32Array,
): void {
  let xl = lr[off];
  let xr = lr[off + 1];

  xl ^= P[0];
  for (let i = 1; i < 17; i += 2) {
    // Round i (odd)
    let f =
      (((S[xl >>> 24] + S[256 | ((xl >>> 16) & 0xff)]) ^
        S[512 | ((xl >>> 8) & 0xff)]) +
        S[768 | (xl & 0xff)]) >>>
      0;
    xr ^= f ^ P[i];

    // Round i+1 (even)
    f =
      (((S[xr >>> 24] + S[256 | ((xr >>> 16) & 0xff)]) ^
        S[512 | ((xr >>> 8) & 0xff)]) +
        S[768 | (xr & 0xff)]) >>>
      0;
    xl ^= f ^ P[i + 1];
  }

  lr[off] = (xr ^ P[17]) >>> 0;
  lr[off + 1] = xl >>> 0;
}

function streamToWord(
  data: Uint8Array,
  off: number,
): { word: number; nextOff: number } {
  let word = 0;
  let o = off;
  const len = data.length;
  for (let i = 0; i < 4; i++) {
    word = ((word << 8) | (data[o] & 0xff)) >>> 0;
    o = (o + 1) % len;
  }
  return { word, nextOff: o };
}

function eksKey(data: Uint8Array, P: Uint32Array, S: Uint32Array): void {
  let off = 0;
  for (let i = 0; i < 18; i++) {
    const r = streamToWord(data, off);
    P[i] = (P[i] ^ r.word) >>> 0;
    off = r.nextOff;
  }

  const lr = new Uint32Array([0, 0]);
  for (let i = 0; i < 18; i += 2) {
    blowfishEncipher(lr, 0, P, S);
    P[i] = lr[0];
    P[i + 1] = lr[1];
  }

  for (let i = 0; i < 1024; i += 2) {
    blowfishEncipher(lr, 0, P, S);
    S[i] = lr[0];
    S[i + 1] = lr[1];
  }
}

function eksKeyWithSalt(
  key: Uint8Array,
  salt: Uint8Array,
  P: Uint32Array,
  S: Uint32Array,
): void {
  let keyOff = 0;
  for (let i = 0; i < 18; i++) {
    const r = streamToWord(key, keyOff);
    P[i] = (P[i] ^ r.word) >>> 0;
    keyOff = r.nextOff;
  }

  let saltOff = 0;
  const lr = new Uint32Array([0, 0]);
  for (let i = 0; i < 18; i += 2) {
    let r = streamToWord(salt, saltOff);
    lr[0] = (lr[0] ^ r.word) >>> 0;
    saltOff = r.nextOff;
    r = streamToWord(salt, saltOff);
    lr[1] = (lr[1] ^ r.word) >>> 0;
    saltOff = r.nextOff;

    blowfishEncipher(lr, 0, P, S);
    P[i] = lr[0];
    P[i + 1] = lr[1];
  }

  for (let i = 0; i < 1024; i += 2) {
    let r = streamToWord(salt, saltOff);
    lr[0] = (lr[0] ^ r.word) >>> 0;
    saltOff = r.nextOff;
    r = streamToWord(salt, saltOff);
    lr[1] = (lr[1] ^ r.word) >>> 0;
    saltOff = r.nextOff;

    blowfishEncipher(lr, 0, P, S);
    S[i] = lr[0];
    S[i + 1] = lr[1];
  }
}

export function verifyBcryptHash(
  storedHash: string,
  plainTextPassword: string,
): boolean {
  const match = storedHash.match(
    /^\$2([abxy])\$(\d{2})\$([./A-Za-z0-9]{22})([./A-Za-z0-9]{31})$/,
  );
  if (!match) {
    return false;
  }

  const cost = Number.parseInt(match[2], 10);
  if (cost < 4 || cost > 31) {
    return false;
  }

  const saltString = match[3];
  const expectedHashPart = match[4];

  const saltBytes = decodeBcryptBase64(saltString, 16);
  // Bcrypt truncates password at 72 bytes and appends a NUL byte (\0)
  const pwUtf8 = Buffer.from(plainTextPassword, "utf8").subarray(0, 72);
  const keyBytes = new Uint8Array(pwUtf8.length + 1);
  keyBytes.set(pwUtf8, 0);
  keyBytes[pwUtf8.length] = 0;

  const init = ensureBlowfishInitTables();
  const P = new Uint32Array(init.p);
  const S = new Uint32Array(init.s);

  eksKeyWithSalt(keyBytes, saltBytes, P, S);
  const rounds = 1 << cost;
  for (let r = 0; r < rounds; r++) {
    eksKey(keyBytes, P, S);
    eksKey(saltBytes, P, S);
  }

  // Encrypt "OrpheanBeholderScryDoubt" (6 x 32-bit big-endian words) 64 times
  const cdata = new Uint32Array([
    0x4f727068, 0x65616e42, 0x65686f6c, 0x64657253, 0x63727944, 0x6f756274,
  ]);

  for (let j = 0; j < 6; j += 2) {
    for (let i = 0; i < 64; i++) {
      blowfishEncipher(cdata, j, P, S);
    }
  }

  const outBytes = new Uint8Array(24);
  for (let i = 0; i < 6; i++) {
    const w = cdata[i];
    outBytes[i * 4] = (w >>> 24) & 0xff;
    outBytes[i * 4 + 1] = (w >>> 16) & 0xff;
    outBytes[i * 4 + 2] = (w >>> 8) & 0xff;
    outBytes[i * 4 + 3] = w & 0xff;
  }

  const computedHashPart = encodeBcryptBase64(outBytes, 23);
  const a = Buffer.from(computedHashPart, "utf8");
  const b = Buffer.from(expectedHashPart, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ============================================================================
 * 2. SHA-512 CRYPT ($6$) VERIFIER
 * ============================================================================
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

  const ctxB = createHash("sha512");
  ctxB.update(keyBuf);
  ctxB.update(saltBuf);
  ctxB.update(keyBuf);
  const altResult = ctxB.digest();

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
 * Verifies a password against:
 * 1. Argon2 hash ($argon2id$ / $argon2i$ / $argon2d$)
 * 2. Moodle standard PHP password_hash Bcrypt ($2y$ / $2a$ / $2b$)
 * 3. Moodle SHA-512 crypt hash ($6$rounds=...)
 * 4. Legacy 32-char hex MD5 hash
 *
 * When a non-Argon2 hash matches, needsArgon2Upgrade is set to true so the caller
 * automatically upgrades the stored hash in the database to Argon2id.
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

  if (
    storedHash.startsWith("$2y$") ||
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2x$")
  ) {
    const valid = verifyBcryptHash(storedHash, plainTextPassword);
    return { valid, needsArgon2Upgrade: valid };
  }

  if (storedHash.startsWith("$6$")) {
    const valid = verifySha512CryptHash(storedHash, plainTextPassword);
    return { valid, needsArgon2Upgrade: valid };
  }

  if (
    /^[0-9a-f]{32}$/i.test(storedHash) &&
    process.env.ALLOW_LEGACY_MD5_MIGRATION === "true"
  ) {
    const md5 = createHash("md5")
      .update(plainTextPassword, "utf8")
      .digest("hex");
    const a = Buffer.from(md5.toLowerCase(), "utf8");
    const b = Buffer.from(storedHash.toLowerCase(), "utf8");
    const valid = a.length === b.length && timingSafeEqual(a, b);
    return { valid, needsArgon2Upgrade: valid };
  }

  return { valid: false, needsArgon2Upgrade: false };
}
