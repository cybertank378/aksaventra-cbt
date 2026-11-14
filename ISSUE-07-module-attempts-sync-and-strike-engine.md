# ⚡ ISSUE-07: Implementasi Modul `src/modules/attempts/` (Batch Sync, Rehydration, Strike Lock, & Final Grading)

- **ID Issue:** `ISSUE-07`
- **Fase:** `2 - Domain & Application Modules`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-03`, `ISSUE-06`
- **File Target (Sesuai Struktur Project):**
  - `src/modules/attempts/domain/dto/SyncBatchDTO.ts`
  - `src/modules/attempts/domain/entities/AttemptSessionEntity.ts`
  - `src/modules/attempts/domain/entities/AnswerRecordEntity.ts`
  - `src/modules/attempts/domain/entities/SecurityStrikeEntity.ts`
  - `src/modules/attempts/domain/interfaces/AttemptRepositoryInterface.ts`
  - `src/modules/attempts/domain/interfaces/LocalVaultInterface.ts`
  - `src/modules/attempts/domain/rules/StrikeEvaluationRule.ts`
  - `src/modules/attempts/domain/rules/AnswerRehydrationRule.ts`
  - `src/modules/attempts/application/usecases/StartAttemptUseCase.ts`
  - `src/modules/attempts/application/usecases/SyncAnswerQueueUseCase.ts`
  - `src/modules/attempts/application/usecases/RecordViolationUseCase.ts`
  - `src/modules/attempts/application/usecases/SubmitAttemptUseCase.ts`
  - `src/modules/attempts/application/AttemptService.ts`
  - `src/modules/attempts/infrastructure/AttemptRepository.ts`
  - `src/modules/attempts/infrastructure/DexieAttemptVault.ts`
  - `src/modules/attempts/infrastructure/attempt.validator.ts`
  - `src/modules/attempts/infrastructure/AttemptController.ts`
  - `src/modules/attempts/presentation/useExamWorkspaceStore.ts`
  - `src/modules/attempts/presentation/useAttemptSyncHook.ts`
  - `src/app/api/attempts/_factory.ts`
  - `src/app/api/attempts/route.ts`
  - `src/app/api/attempts/[id]/sync/route.ts`
  - `src/app/api/attempts/[id]/violation/route.ts`
  - `src/app/api/attempts/[id]/submit/route.ts`

## 1. Deskripsi Tugas
Mengimplementasikan jantung pengerjaan ujian CBT selaras dengan Moodle `mod_cbt`:
1. **`StrikeEvaluationRule.ts`:** Selaras dengan `strike_policy.php`. Membedakan *Hard Strike* (`TAB_BLUR` / `FULLSCREEN_EXIT` -> 0ms langsung strike), *DevTools Trap* (`DEVTOOLS_OPEN` -> immediate lockdown), dan *Soft Blur* (`window.onblur` -> *Grace Period* 2.500ms). Jika `nextStrikeCount >= maxStrikes`, ubah status attempt menjadi `LOCKED`.
2. **`AnswerRehydrationRule.ts` & `SyncAnswerQueueUseCase.ts`:** Menggabungkan jawaban per `questionId` (`{ ans, flag, ts }` selaras dengan `sync_batch_answers.php`) berdasarkan timestamp terbaru (`updatedAt` / `ts`) sehingga paket jaringan yang datang terlambat tidak pernah menimpa jawaban yang lebih baru (*Last-Write-Wins per Question*).
3. **`useExamWorkspaceStore.ts`:** Store Zustand untuk navigasi soal `< 16ms` yang **tidak** menyimpan state `remainingSeconds` (agar tidak memicu *re-render cascade* setiap detik).
4. **`SubmitAttemptUseCase.ts`:** Menunggu antrean sinkronisasi selesai via `AsyncSyncMutex`, menghitung nilai akhir dari `exam.answerKeysJson` (selaras dengan `score_calculator.php`), dan menutup sesi ujian via `mod_cbt_submit_exam`.

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/modules/attempts/StrikeEvaluationRule.test.ts` lulus 100%.
- [ ] `tests/unit/modules/attempts/AnswerRehydrationRule.test.ts` lulus pengujian penggabungan jawaban *out-of-order*.
- [ ] `tests/unit/modules/attempts/SubmitAttemptUseCase.test.ts` lulus pengujian kalkulasi skor dan penguncian sesi.
