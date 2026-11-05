# 🗺️ Architecture & Engineering Planning: `aksaventra-cbt` (Next.js 16 + Moodle mod_cbt)

Dokumen perencanaan arsitektur menyeluruh sistem **Aksaventra CBT** yang terintegrasi secara *headless* dengan modul backend Moodle **`mod_cbt`** (`D:\Project\moodle_installer\moodle\mod\cbt`).

---

## 1. Tujuan Arsitektural
Membangun antarmuka ujian berkecepatan tinggi (**Zero-Latency Exam Workspace**) dan ruang kendali pengawas (**Real-Time Proctor Command Center**) menggunakan **Modular Clean Architecture + Atomic UI Sections** pada Next.js 16, React 19, TypeScript, Tailwind CSS v4, dan Prisma v7 (mendukung MariaDB dan PostgreSQL).

Sistem ini menggantikan perenderan monolitik Moodle `mod_quiz` standar dengan mendelegasikan state rendering ke frontend, menyimpan jawaban secara **Offline-First (< 5ms)**, dan menyinkronkan data ke Moodle `mod_cbt` via **Idempotent Atomic Batch Upsert**.

---

## 2. Pohon Direktori Utama (`src/`)

```text
src/
├── app/                                  # Next.js 16 App Router
│   ├── (public)/                         # Halaman publik (Login / Moodle Redirect Landing)
│   ├── (protected)/                      # Halaman terautentikasi (JWT / Session Guard)
│   │   ├── student/
│   │   │   ├── lobby/[cbtId]/page.tsx    # Lobi ujian, Pre-Flight check, Fullscreen & Token trigger
│   │   │   └── exam/[attemptId]/page.tsx # Zero-latency exam workspace
│   │   └── dashboard/
│   │       ├── proctor/[cbtId]/page.tsx  # Proctor real-time command center
│   │       └── admin/                    # Pengaturan server & sinkronisasi
│   └── api/                              # Backend-for-Frontend (BFF) Endpoints (_factory.ts DI)
│       ├── auth/
│       │   ├── moodle-launch/route.ts    # Handshake bridge dari Moodle launch.php
│       │   └── login/route.ts
│       ├── exams/[id]/snapshot/route.ts  # Cached snapshot proxy
│       ├── attempts/[id]/
│       │   ├── sync/route.ts             # Batch sync proxy ke mod_cbt_sync_batch_answers
│       │   ├── violation/route.ts        # Audit proxy ke mod_cbt_report_violation
│       │   └── submit/route.ts           # Final submit proxy ke mod_cbt_submit_exam
│       ├── proctor/[cbtId]/action/route.ts # Proctor intervention ke mod_cbt_proctor_control
│       └── moodle-proxy/[...wsfunction]/route.ts # Gateway aman server-to-server ke Moodle
│
├── core/                                 # Fondasi Clean Architecture & Error Handling
│   ├── base/                             # Result.ts, BaseEntity, BaseUseCase, BaseRepository, BaseController
│   ├── errors/                           # AppError, DomainError, OptimisticLockError, handleZodError, ApiError
│   ├── types/                            # ApiResponse.ts, PaginationDTO.ts
│   ├── utils/                            # HttpResultHandler.ts, RouteParamHelper.ts
│   └── env.ts                            # Validasi Zod variabel lingkungan
│
├── libs/                                 # Pustaka Inti & Low-Level Integrations
│   ├── prisma.ts                         # Singleton Prisma v7 (Dual Driver: MariaDB & PostgreSQL)
│   ├── dexieVault.ts                     # IndexedDB offline storage (Dexie.js)
│   ├── serverDeltaTimer.ts               # Kalibrasi jam server monotonik (performance.now)
│   ├── katexSanitizer.ts                 # LaTeX math rendering & sanitasi HTML stimulus soal
│   └── dateUtils.ts                      # Utilitas waktu & pemformatan tanggal
│
├── modules/                              # Logika Bisnis Terisolasi per Domain
│   ├── auth/                             # Autentikasi sesi & handshake Moodle launch token
│   ├── exams/                            # Pengambilan & caching snapshot naskah soal
│   ├── attempts/                         # Sesi ujian, antrean batch sync, strike policy, dan final submit
│   ├── proctor/                          # Monitoring matriks siswa, token rotasi TOTP, dan aksi pengawas
│   └── users/                            # Manajemen data siswa & pengawas
│
├── sections/                             # Atomic UI Component Sections (Organisms & Pages)
│   ├── auth/                             # Komponen login form & feedback
│   ├── student-lobby/                    # Pre-flight check grid, SEB banner, Token verifier modal
│   ├── exam-workspace/                   # QuestionCanvas, QuestionNavGrid, ServerTimerBadge, ShieldModal
│   └── proctor-room/                     # LiveParticipantGrid, TokenProjectorCard, ParticipantActionModal
│
├── security/                             # Pengaman Layar & Ujian
│   ├── quizFocusGuard.ts                 # Deteksi tab blur, grace period 2.5s, fullscreen guard, devtools trap
│   ├── sebHeaderValidator.ts             # Validasi header Safe Exam Browser
│   ├── deviceFingerprint.ts              # Pengikatan hardware/browser hash ke attempt
│   └── rbacConfig.ts                     # Definisi hak akses role (ADMIN, TEACHER, PROCTOR, STUDENT)
│
├── shared/                               # Klien Jaringan & Utilitas Klien
│   └── api/
│       ├── apiRequest.ts                 # Fetch wrapper dengan interceptor & error handling
│       └── apiQueue.ts                   # Sequential Mutex barrier & random jitter scheduler
│
├── shared-ui/                            # Atomic Design System (Atoms & Molecules)
│   ├── component/                        # Button, Card, Modal, Table, Badge, Switch, InputField
│   └── layout/                           # AppLayout, ExamFocusLayout, AppTopbar, AppSidebar
│
└── proxy.ts                              # Next.js Middleware (JWT verification, route protection, SEB guard)
```

---

## 3. Rencana Fase Implementasi Sekuensial (Issues Alignment)

### Fase 1: Database Schema, Core Base & Low-Level Libraries
- **ISSUE-01:** Pembuatan Skema Database (`prisma/schema.prisma`), Adapter Ganda (`@prisma/adapter-mariadb` & `@prisma/adapter-pg`), dan Singleton `src/libs/prisma.ts`. *(Selesai - PR #2)*
- **ISSUE-02:** Lapisan Fondasi `src/core/base/` (`Result.ts`, `BaseEntity`, `BaseUseCase`, dll.), Hierarki Error, dan `HttpResultHandler.ts`. *(Selesai - PR #4)*
- **ISSUE-03:** Pustaka Inti `src/libs/` (`dexieVault.ts`, `serverDeltaTimer.ts`, `katexSanitizer.ts`) & `src/shared/api/` (`apiQueue.ts` Mutex + Jitter, `apiRequest.ts`).
- **ISSUE-04:** Komponen Pengaman `src/security/` (`quizFocusGuard.ts`, `sebHeaderValidator.ts`, `deviceFingerprint.ts`) dan Next.js Middleware `src/proxy.ts`.

### Fase 2: Domain & Application Modules (Moodle mod_cbt API Gateway)
- **ISSUE-05:** Modul `src/modules/auth/` & Endpoint `/api/auth/moodle-launch` (Handshake token dari `launch.php`).
- **ISSUE-06:** Modul `src/modules/exams/` & Proxy Snapshot Soal `/api/exams/[id]/snapshot` (`mod_cbt_get_exam_manifest`).
- **ISSUE-07:** Modul `src/modules/attempts/` (Antrean Batch Sync dengan Mutex & Jitter, Evaluasi Strike `TAB_BLUR` / `FULLSCREEN_EXIT`, Final Submit ke `mod_cbt_submit_exam`).
- **ISSUE-08:** Modul `src/modules/proctor/` (Live Matrix, Token Rotator TOTP Base32, dan Aksi Intervensi `mod_cbt_proctor_control`).

### Fase 3: Shared UI & Atomic Sections
- **ISSUE-09:** Komponen UI Dasar `src/shared-ui/component/*` dan Layout Layar Penuh Ujian `src/shared-ui/layout/ExamFocusLayout.tsx`.
- **ISSUE-10:** Section `src/sections/student-lobby/` (Pre-Flight Check, SEB Guard Banner, Synchronous Fullscreen Trigger, dan Token Input Modal).
- **ISSUE-11:** Section `src/sections/exam-workspace/` (Zero-Latency Workspace: `QuestionCanvas`, `QuestionNavGrid`, `ServerTimerBadge`, `BlurGraceWarningBanner`, `LockdownShieldModal`).
- **ISSUE-12:** Section `src/sections/proctor-room/` (`LiveParticipantGrid`, `TokenProjectorCard`, `ParticipantActionModal`) & Dashboard Pengawas.
