# 🛡️ ISSUE-SEC-01: False-Positive Strike Akibat Notifikasi OS, Low-Battery Pop-up, atau Permission Prompt

- **ID Issue:** `ISSUE-SEC-01`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/modules/attempts/domain/rules/StrikeEvaluationRule.ts`
  - `src/modules/attempts/application/usecases/RecordViolationUseCase.ts`
  - `src/sections/exam-workspace/molecules/BlurGraceWarningBanner.tsx`
  - `src/security/quizFocusGuard.ts`

## 1. Akar Masalah (Root Cause)
Pada perangkat Windows, macOS, Android, dan iOS, munculnya dialog sistem (seperti peringatan baterai lemah 10%, notifikasi sistem, atau *pop-up* jaringan Wi-Fi) secara otomatis mencuri fokus jendela (*window focus*) dari *browser*. Hal ini memicu event `window.onblur` meskipun properti `document.hidden` bernilai `false` (layar ujian masih terlihat penuh oleh siswa). Jika setiap `window.onblur` langsung dihitung sebagai *Strike* mutlak, siswa akan terkunci (`status = 'locked'`) secara tidak adil.

## 2. Strategi Mitigasi Teknis (Two-Tier Violation State Machine)
1. **Hard Strike (0ms Tolerance):** Jika `document.visibilityState === 'hidden'` atau `document.hidden === true` (siswa menekan `Alt+Tab`, berpindah tab, atau meminimalkan *browser*), langsung catat sebagai **1 Strike** detik itu juga tanpa jeda.
2. **Soft Blur Grace Period (2.500ms Buffer):** Jika `window.onblur` terpicu tetapi `document.hidden === false`, aktifkan *countdown* `2500ms` dan tampilkan `<BlurGraceWarningBanner />` berwarna kuning (`#eab308`): *"Fokus layar keluar! Klik kembali ke lembar ujian dalam 2.5 detik!"*
3. **Recovery vs Escalation:** Jika `window.onfocus` terpicu sebelum `2500ms` habis, batalkan *Strike* dan catat hanya sebagai `BLUR_WARNING`. Jika melebihi `2500ms`, konversi menjadi **1 Strike** dan panggil `RecordViolationUseCase`.

## 3. Implementasi Kode Domain (`StrikeEvaluationRule.ts`)
```typescript
export type ViolationType = 'TAB_HIDDEN' | 'WINDOW_BLUR_TIMEOUT' | 'FULLSCREEN_EXIT';

export interface StrikeEvaluationInput {
  type: ViolationType;
  blurDurationMs: number;
  isDocumentHidden: boolean;
  currentStrikes: number;
  maxStrikes: number;
}

export interface StrikeEvaluationResult {
  shouldIncrementStrike: boolean;
  nextStrikeCount: number;
  shouldLockAttempt: boolean;
  reason: ViolationType | 'GRACE_PERIOD_RECOVERED';
}

export const BLUR_GRACE_PERIOD_MS = 2500;

export function evaluateSecurityViolation(input: StrikeEvaluationInput): StrikeEvaluationResult {
  if (input.isDocumentHidden || input.type === 'TAB_HIDDEN' || input.type === 'FULLSCREEN_EXIT') {
    const nextStrikeCount = input.currentStrikes + 1;
    return {
      shouldIncrementStrike: true,
      nextStrikeCount,
      shouldLockAttempt: nextStrikeCount >= input.maxStrikes,
      reason: input.type,
    };
  }

  if (input.type === 'WINDOW_BLUR_TIMEOUT' && input.blurDurationMs >= BLUR_GRACE_PERIOD_MS) {
    const nextStrikeCount = input.currentStrikes + 1;
    return {
      shouldIncrementStrike: true,
      nextStrikeCount,
      shouldLockAttempt: nextStrikeCount >= input.maxStrikes,
      reason: 'WINDOW_BLUR_TIMEOUT',
    };
  }

  return {
    shouldIncrementStrike: false,
    nextStrikeCount: input.currentStrikes,
    shouldLockAttempt: false,
    reason: 'GRACE_PERIOD_RECOVERED',
  };
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/domain/StrikeEvaluationRule.test.ts`)
- `it('tidak menambah strike jika window blur < 2500ms dan dokumen tetap terlihat')`
- `it('langsung menambah strike tanpa grace period jika document.hidden bernilai true')`
- `it('mengubah shouldLockAttempt menjadi true saat nextStrikeCount mencapai maxStrikes')`
