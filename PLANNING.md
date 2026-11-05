# 🗺️ Architecture & Engineering Planning: `aksaventra-cbt` (Next.js 16 Modular Clean Architecture)

## 1. Tujuan Arsitektural
Membangun sistem **Aksaventra CBT** menggunakan pola **Modular Clean Architecture + Atomic UI Sections** yang telah disederhanakan dari boilerplate enterprise, sehingga setiap domain (`auth`, `exams`, `attempts`, `proctor`, `users`) terisolasi dengan rapi di dalam `src/modules/` dan dirender melalui komponen terstruktur di dalam `src/sections/`.

## 2. Pohon Direktori Utama (`src/`)
- `src/app/`: Routing Next.js 16 (`(protected)`, `(public)`, dan `api/` dengan pola `_factory.ts` Dependency Injection).
- `src/core/`: Kelas dasar abstrak (`BaseEntity`, `BaseUseCase`, `BaseController`, `BaseRepository`, `Result<T>`), penanganan error (`DomainError`, `OptimisticLockError`), dan utilitas HTTP.
- `src/libs/`: Integrasi pustaka tingkat rendah (`prisma.ts` v7, `dexieVault.ts`, `katexSanitizer.ts`, `serverDeltaTimer.ts`).
- `src/modules/`: Logika bisnis & data per fitur (`auth`, `exams`, `attempts`, `proctor`, `users`), masing-masing hanya terdiri dari:
  - `application/` (`Service` & `usecases/`)
  - `domain/` (`dto/`, `entities/`, `interfaces/`, `rules/`)
  - `infrastructure/` (`Controller`, `Repository`, `validator`)
  - `presentation/` (Zustand store & API hooks)
- `src/sections/`: Komponen tampilan berbasis *Atomic Design* (`atoms/`, `molecules/`, `organisms/`, `pages/`) untuk `auth`, `student-lobby`, `exam-workspace`, dan `proctor-room`.
- `src/security/`: Pengaman ujian (`sebHeaderValidator.ts`, `quizFocusGuard.ts`, `deviceFingerprint.ts`, `rbacConfig.ts`).
- `src/shared/` & `src/shared-ui/`: Klien HTTP (`apiRequest.ts`, `apiQueue.ts`) dan komponen UI dasar (`Button`, `Card`, `Modal`, `Table`, `ExamFocusLayout`).
- `src/proxy.ts`: Middleware / Proxy autentikasi JWT, RBAC route guard, dan validasi header SEB.
