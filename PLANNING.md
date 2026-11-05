# 🗺️ Architecture & Engineering Planning: `aksaventra-cbt-ui` (Next.js 16 + TypeScript)

## 1. Tujuan Arsitektural
Membangun antarmuka ujian siswa (**Zero-Latency Exam Workspace**) dan ruang kendali pengawas (**Real-Time Proctor Command Center**) menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript 5+**, **Tailwind CSS v4**, **Biome**, **Vitest**, dan **Prisma v7** dengan prinsip **Offline-First**.

## 2. Struktur Direktori Clean Architecture
```text
src/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── ExamTypes.ts
│   │   │   ├── ExamSession.ts
│   │   │   ├── AnswerRecord.ts
│   │   │   └── SecurityStrike.ts
│   │   └── ports/
│   │       ├── IExamRepository.ts
│   │       └── ILocalVault.ts
│   └── usecases/
│       ├── SyncAnswerQueueUseCase.ts
│       ├── RecordViolationUseCase.ts
│       └── SubmitExamUseCase.ts
├── infrastructure/
│   ├── api/MoodleCbtApiClient.ts
│   ├── storage/
│   │   ├── DexieExamVault.ts
│   │   └── prisma.ts
│   └── security/SebHeaderValidator.ts
├── store/
│   ├── useExamStore.ts
│   └── useProctorStore.ts
├── components/
│   ├── exam/
│   │   ├── QuestionCanvas.tsx
│   │   ├── QuestionNavGrid.tsx
│   │   ├── ServerTimerBadge.tsx
│   │   ├── SyncStatusIndicator.tsx
│   │   └── LockdownShieldModal.tsx
│   └── proctor/
│       ├── LiveParticipantGrid.tsx
│       ├── TokenProjectorCard.tsx
│       └── ParticipantActionModal.tsx
└── app/
    ├── (student)/lobby/[cbtId]/page.tsx
    ├── (student)/exam/[attemptId]/page.tsx
    ├── (proctor)/proctor/[cbtId]/page.tsx
    └── api/proxy/[...wsfunction]/route.ts
```
