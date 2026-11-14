# 🗄️ ISSUE-01: Pembuatan Skema Database PostgreSQL & Konfigurasi Prisma v7 (`@prisma/adapter-pg`)

- **ID Issue:** `ISSUE-01`
- **Fase:** `1 - Database & Core Foundation`
- **Prioritas:** `P0 (Blocker - Langkah Pertama)`
- **File Target (Sesuai Struktur Project):**
  - `prisma/schema.prisma`
  - `src/core/env.ts`
  - `src/libs/prisma.ts`
  - `tests/unit/libs/prisma.test.ts`

## 1. Deskripsi Tugas
Membangun fondasi penyimpanan data relasional menggunakan **Prisma v7 (`^7.10.1`)** dan driver adapter **`@prisma/adapter-pg`** untuk menyimpan data `User`, `Exam` (beserta cache JSON Snapshot dari Moodle), `Attempt` (sesi pengerjaan, `answersJson`, `syncVersion` untuk *optimistic locking*, `deviceHash`, dan `strikeCount`), serta `ViolationLog` (audit kecurangan dan aksi proktor).

## 2. Aturan Arsitektur Wajib (`AGENTS.md`)
1. Wajib menggunakan `@prisma/adapter-pg` dengan `Pool` dari paket `pg` sesuai spesifikasi `package.json`.
2. Tabel `Attempt` wajib memiliki kolom `syncVersion Int @default(0)` untuk mendukung `OptimisticLockError` di `src/core/errors/OptimisticLockError.ts` dan indeks komposit `@@unique([examId, userId])`.
3. Validasi variabel `DATABASE_URL` dan `CBT_JWT_SECRET` secara ketat di `src/core/env.ts` menggunakan **Zod**.

## 3. Spesifikasi `prisma/schema.prisma`
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  TEACHER
  PROCTOR
  STUDENT
}

enum AttemptStatus {
  IN_PROGRESS
  LOCKED
  SUBMITTED
  ABANDONED
}

enum ViolationEventType {
  TAB_BLUR
  FULLSCREEN_EXIT
  DEVTOOLS_OPEN
  PROCTOR_UNLOCK
  PROCTOR_RESET_DEVICE
  TIME_EXTEND
  FORCE_SUBMIT
}

model User {
  id           String    @id @default(uuid())
  moodleUserId Int?      @unique
  username     String    @unique
  fullName     String
  passwordHash String
  role         UserRole  @default(STUDENT)
  className    String?
  roomCode     String?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  attempts     Attempt[]

  @@index([role, roomCode])
}

model Exam {
  id              String    @id @default(uuid())
  moodleCbtId     Int       @unique
  title           String
  courseName      String
  durationSeconds Int       @default(7200)
  maxStrikes      Int       @default(3)
  sebRequired     Boolean   @default(false)
  sebConfigKey    String?
  activeToken     String    @db.VarChar(10)
  tokenExpiresAt  DateTime
  snapshotHash    String?
  questionsJson   Json      // Array ExamQuestionItem (tanpa kunci jawaban)
  answerKeysJson  Json      // Map privat { questionId: correctKey } khusus server
  timeOpen        DateTime
  timeClose       DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  attempts        Attempt[]
}

model Attempt {
  id               String          @id @default(uuid())
  moodleAttemptId  Int?            @unique
  examId           String
  userId           String
  status           AttemptStatus   @default(IN_PROGRESS)
  startedAt        DateTime        @default(now())
  finishedAt       DateTime?
  extraTimeSeconds Int             @default(0)
  strikeCount      Int             @default(0)
  deviceHash       String          @db.VarChar(128)
  ipAddress        String          @db.VarChar(45)
  questionOrder    Json            // Array urutan slot/questionId per siswa
  answersJson      Json            @default("{}")
  syncVersion      Int             @default(0)
  finalScore       Float?
  syncedToMoodle   Boolean         @default(false)
  lastHeartbeatAt  DateTime        @default(now())
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  exam          Exam           @relation(fields: [examId], references: [id], onDelete: Cascade)
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  violationLogs ViolationLog[]

  @@unique([examId, userId])
  @@index([examId, status])
}

model ViolationLog {
  id        String             @id @default(uuid())
  attemptId String
  eventType ViolationEventType
  details   Json?
  createdAt DateTime           @default(now())

  attempt Attempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@index([attemptId, createdAt])
}
```

## 4. Implementasi `src/libs/prisma.ts` (Prisma v7 + PG Adapter)
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { env } from '@/core/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## 5. Kriteria Selesai (Definition of Done & TDD)
- [ ] Menjalankan `npx prisma generate` berhasil tanpa error.
- [ ] File `src/core/env.ts` memvalidasi seluruh environment variables dengan Zod.
- [ ] Unit test `tests/unit/libs/prisma.test.ts` memastikan instance `prisma` bersifat singleton.
