# 🌐 ISSUE-NET-02: Konflik Rehidrasi `IndexedDB` Saat Siswa Menekan Refresh (`F5`) atau Listrik Mati

- **ID Issue:** `ISSUE-NET-02`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/modules/attempts/domain/rules/AnswerRehydrationRule.ts`
  - `src/modules/attempts/infrastructure/DexieAttemptVault.ts`
  - `src/modules/attempts/presentation/useExamWorkspaceStore.ts`

## 1. Akar Masalah (Root Cause)
Ketika siswa menekan `F5` (Refresh) atau komputer mati mendadak, state di memori Zustand (`useExamWorkspaceStore`) hilang. Jika saat halaman dimuat ulang aplikasi langsung menimpa state lokal dengan *payload* dari server (yang mungkin tertinggal 15 detik dari jawaban terakhir di IndexedDB), jawaban terbaru siswa di lokal akan terhapus.

## 2. Strategi Mitigasi Teknis (Timestamp-Based Three-Way Hydration)
1. **Pre-Flight Vault Test:** Di halaman `/student/lobby/[examId]`, uji tulis-baca-hapus 1 baris *dummy* ke `DexieAttemptVault`. Jika gagal (misal karena *QuotaExceededError*), tampilkan peringatan sebelum ujian dimulai.
2. **Deterministic Rehydration Rule:** Saat halaman `/student/exam/[attemptId]` dimuat ulang, gabungkan (*merge*) jawaban dari Server dan jawaban dari `DexieAttemptVault` per `questionId` dengan memenangkan entri yang memiliki `updatedAt` paling baru.

## 3. Implementasi Kode (`AnswerRehydrationRule.ts`)
```typescript
import type { LocalAnswerEntry } from '../entities/AnswerRecordEntity';

export function mergeServerAndLocalAnswers(
  serverAnswers: Record<number, LocalAnswerEntry>,
  localAnswers: Record<number, LocalAnswerEntry>
): {
  merged: Record<number, LocalAnswerEntry>;
  hasUnsyncedLocalWins: boolean;
} {
  const merged: Record<number, LocalAnswerEntry> = { ...serverAnswers };
  let hasUnsyncedLocalWins = false;

  for (const [qIdStr, localEntry] of Object.entries(localAnswers)) {
    const qId = Number(qIdStr);
    const serverEntry = merged[qId];

    if (!serverEntry || localEntry.updatedAt >= serverEntry.updatedAt) {
      merged[qId] = localEntry;
      if (!localEntry.synced) {
        hasUnsyncedLocalWins = true;
      }
    }
  }

  return { merged, hasUnsyncedLocalWins };
}
```

## 4. Cakupan Integration Test Wajib (`tests/integration/DexieRehydration.test.ts`)
- `it('mempertahankan jawaban lokal di IndexedDB yang memiliki updatedAt lebih baru daripada jawaban server saat refresh')`
- `it('menandai hasUnsyncedLocalWins = true agar background sync langsung dijadwalkan')`
