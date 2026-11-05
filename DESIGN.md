# 🎨 Core Pattern, DTO & State Design: `aksaventra-cbt`

## 1. Pola Dependency Injection API (`src/app/api/attempts/_factory.ts`)
```typescript
import { prisma } from '@/libs/prisma';
import { AttemptRepository } from '@/modules/attempts/infrastructure/AttemptRepository';
import { SyncAnswerQueueUseCase } from '@/modules/attempts/application/usecases/SyncAnswerQueueUseCase';
import { RecordViolationUseCase } from '@/modules/attempts/application/usecases/RecordViolationUseCase';
import { SubmitAttemptUseCase } from '@/modules/attempts/application/usecases/SubmitAttemptUseCase';
import { AttemptService } from '@/modules/attempts/application/AttemptService';
import { AttemptController } from '@/modules/attempts/infrastructure/AttemptController';

export function makeAttemptController(): AttemptController {
  const repo = new AttemptRepository(prisma);
  const syncUseCase = new SyncAnswerQueueUseCase(repo);
  const violationUseCase = new RecordViolationUseCase(repo);
  const submitUseCase = new SubmitAttemptUseCase(repo);
  const service = new AttemptService(syncUseCase, violationUseCase, submitUseCase);
  return new AttemptController(service);
}
```

## 2. Pola Atomic Section di Next.js Page (`src/app/(protected)/student/exam/[attemptId]/page.tsx`)
File `page.tsx` di dalam `src/app/` dijaga tetap tipis (< 25 baris) dan hanya memanggil `Section` dari `src/sections/`:
```tsx
import { ExamWorkspaceSection } from '@/sections/exam-workspace/pages/ExamWorkspaceSection';

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function StudentExamPage({ params }: PageProps) {
  const { attemptId } = await params;
  return <ExamWorkspaceSection attemptId={attemptId} />;
}
```
