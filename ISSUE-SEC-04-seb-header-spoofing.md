# 🛡️ ISSUE-SEC-04: Bypass Validasi Safe Exam Browser (SEB) via *Client-Side Header Spoofing*

- **ID Issue:** `ISSUE-SEC-04`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/security/sebHeaderValidator.ts`
  - `src/proxy.ts`

## 1. Akar Masalah (Root Cause)
Jika pemeriksaan SEB hanya mengandalkan pengecekan `navigator.userAgent.includes('SEB')` di sisi klien (browser), peserta yang paham teknis dapat mengubah *User-Agent* di browser Chrome biasa menggunakan ekstensi dan melewati gerbang lobby ujian.

## 2. Strategi Mitigasi Teknis
Validasi SEB wajib dilakukan di **Server-Side (`src/proxy.ts` & API Route)** menggunakan header kriptografi `X-SafeExamBrowser-ConfigKeyHash` atau `X-SafeExamBrowser-RequestHash`. Server menghitung ulang `SHA-256(requestUrl + expectedConfigKeyHash)` dan membandingkannya secara aman.

## 3. Implementasi Kode (`src/security/sebHeaderValidator.ts`)
```typescript
import { createHash, timingSafeEqual } from 'node:crypto';

export function verifySebRequestHash(
  requestUrl: string,
  expectedConfigKeyHash: string,
  incomingRequestHashHeader: string | null
): boolean {
  if (!incomingRequestHashHeader) {
    return false;
  }

  const expectedHash = createHash('sha256')
    .update(requestUrl + expectedConfigKeyHash, 'utf8')
    .digest('hex');

  const a = Buffer.from(expectedHash.toLowerCase(), 'utf8');
  const b = Buffer.from(incomingRequestHashHeader.trim().toLowerCase(), 'utf8');

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/security/SebHeaderValidator.test.ts`)
- `it('mengembalikan true jika X-SafeExamBrowser-RequestHash cocok dengan SHA-256(url + configKeyHash)')`
- `it('menolak request jika hanya mengandalkan User-Agent tanpa header hash yang valid')`
