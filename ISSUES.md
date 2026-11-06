# 🗂️ Sequential Implementation Issues (`aksaventra-cbt` — Next.js 16 + Prisma v7)

Seluruh *issue* diurutkan secara sekuensial mulai dari **Fase 1 (Database & Core Foundation)** hingga **Fase 4 (UI Sections & Real-Time Proctor)** dengan mematuhi secara ketat struktur direktori proyek (`src/core`, `src/libs`, `src/security`, `src/shared`, `src/modules`, `src/sections`, `src/shared-ui`, `src/app`, dan `src/proxy.ts`):

## Fase 1: Database Schema, Core Base & Low-Level Libraries
1. [`ISSUE-01-database-schema-and-prisma-v7.md`](./ISSUE-01-database-schema-and-prisma-v7.md) — Pembuatan Skema Database (`prisma/schema.prisma`), Konfigurasi Adapter `@prisma/adapter-pg`, dan Singleton `src/libs/prisma.ts`.
2. [`ISSUE-02-core-base-and-error-handling.md`](./ISSUE-02-core-base-and-error-handling.md) — Implementasi Lapisan Fondasi `src/core/base/` (`Result.ts`, `BaseEntity.ts`, `BaseUseCase.ts`, `BaseRepository.ts`, `BaseService.ts`, `BaseController.ts`) & `src/core/errors/`.
3. [`ISSUE-03-libs-offline-vault-timer-katex.md`](./ISSUE-03-libs-offline-vault-timer-katex.md) — Implementasi Pustaka Inti `src/libs/` (`dexieVault.ts`, `serverDeltaTimer.ts`, `katexSanitizer.ts`, `DateUtils.ts`) & `src/shared/api/` (`apiQueue.ts`, `apiRequest.ts`).
4. [`ISSUE-04-security-guards-and-edge-proxy.md`](./ISSUE-04-security-guards-and-edge-proxy.md) — Implementasi `src/security/` (`sebHeaderValidator.ts`, `quizFocusGuard.ts`, `deviceFingerprint.ts`, `rbacConfig.ts`) dan `src/proxy.ts`.

## Fase 2: Domain & Application Modules (`src/modules/*` & `src/app/api/*`)
5. [`ISSUE-05-module-auth-and-users.md`](./ISSUE-05-module-auth-and-users.md) — Implementasi Modul `src/modules/auth/` & `src/modules/users/` beserta Endpoint `/api/auth/*` (`_factory.ts`).
6. [`ISSUE-06-module-exams-and-moodle-snapshot.md`](./ISSUE-06-module-exams-and-moodle-snapshot.md) — Implementasi Modul `src/modules/exams/` & Proxy Sinkronisasi Snapshot `/api/exams/[id]/snapshot` + `/api/moodle-proxy/[...wsfunction]`.
7. [`ISSUE-07-module-attempts-sync-and-strike-engine.md`](./ISSUE-07-module-attempts-sync-and-strike-engine.md) — Implementasi Modul `src/modules/attempts/` (Start, Batch Sync dengan Jitter & Mutex, Strike Evaluation Rule, Rehydration Rule, Final Submit) & `/api/attempts/[id]/*`.
8. [`ISSUE-08-module-proctor-control-engine.md`](./ISSUE-08-module-proctor-control-engine.md) — Implementasi Modul `src/modules/proctor/` (Live Participants, Rotate Token, Unlock Strike, Reset Device, Extend Time, Force Submit) & `/api/proctor/[examId]/*`.

## Fase 3: Shared UI & Atomic Sections (`src/shared-ui/*` & `src/sections/*`)
9. [`ISSUE-09-shared-ui-design-system-and-layouts.md`](./ISSUE-09-shared-ui-design-system-and-layouts.md) — Implementasi Komponen Dasar `src/shared-ui/component/*` dan Layout `src/shared-ui/layout/*` (`AppLayout.tsx`, `ExamFocusLayout.tsx`).
10. [`ISSUE-10-section-auth-and-student-lobby.md`](./ISSUE-10-section-auth-and-student-lobby.md) — Implementasi Atomic Section `src/sections/auth/` & `src/sections/student-lobby/` (Pre-Flight Check, Synchronous Fullscreen Trigger, Token Input) beserta halaman App Router.
11. [`ISSUE-11-section-exam-workspace-zero-latency.md`](./ISSUE-11-section-exam-workspace-zero-latency.md) — Implementasi Atomic Section `src/sections/exam-workspace/` (`ServerTimerBadge`, `QuestionCanvas`, `QuestionNavGrid`, `BlurGraceWarningBanner`, `LockdownShieldModal`, `OfflineReceiptModal`).
12. [`ISSUE-12-section-proctor-room-and-dashboards.md`](./ISSUE-12-section-proctor-room-and-dashboards.md) — Implementasi Atomic Section `src/sections/proctor-room/` (`LiveParticipantGrid`, `TokenProjectorCard`, `ParticipantActionModal`) & `/dashboard/*`.

## Fase 4: Integrasi End-to-End Backend Moodle (`mod_cbt`) & Rekapitulasi
13. [`ISSUE-13-full-workflow-integration.md`](./ISSUE-13-full-workflow-integration.md) — Integrasi End-to-End Manajemen Jadwal, Peserta & Nomor Meja, Live Proctoring (Auto-Lock & Unlock False Alarm), dan Rekapitulasi Nilai dengan Backend Moodle `mod_cbt`.
