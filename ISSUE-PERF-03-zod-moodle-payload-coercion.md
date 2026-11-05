# ⚡ ISSUE-PERF-03: Kegagalan Validasi Skema `Zod` Akibat Inkonkonsistensi Tipe Data JSON dari PHP Moodle

- **ID Issue:** `ISSUE-PERF-03`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/modules/exams/infrastructure/exam.validator.ts`
  - `src/modules/attempts/infrastructure/attempt.validator.ts`

## 1. Akar Masalah (Root Cause)
Fungsi `json_encode()` pada PHP / Moodle External API sering kali mengembalikan angka (`id`, `slot`, `timestart`) sebagai *string* (`"5012"`) atau *associative array* kosong `{}` sebagai *array* kosong `[]` ketika siswa belum menjawab satu soal pun. Dengan aturan `Strict TypeScript` dan validasi **Zod**, perbedaan antara `"5012"` dan `5012` atau `[]` dan `{}` akan memicu `ZodError` yang menggagalkan pemuatan halaman ujian.

## 2. Strategi Mitigasi Teknis (Defensive Zod Coercion Schema)
Gunakan `z.coerce.number()` dan `z.preprocess()` pada seluruh validator respons Moodle.

## 3. Implementasi Kode (`src/modules/exams/infrastructure/exam.validator.ts`)
```typescript
import { z } from 'zod';

export const QuestionOptionSchema = z.object({
  key: z.string(),
  html: z.string(),
});

export const ExamQuestionItemSchema = z.object({
  slot: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  type: z.enum(['multichoice_single', 'multichoice_multi', 'shortanswer', 'matching']),
  stemHtml: z.string(),
  options: z.array(QuestionOptionSchema).default([]),
});

export const ServerAnswersMapSchema = z.preprocess(
  (val) => (Array.isArray(val) && val.length === 0 ? {} : val),
  z.record(
    z.string(),
    z.object({
      ans: z.union([z.string(), z.array(z.string())]),
      flag: z.coerce.boolean(),
      ts: z.coerce.number(),
    })
  )
);
```

## 4. Cakupan Unit Test Wajib (`tests/unit/infrastructure/ZodMoodlePayload.test.ts`)
- `it('mengonversi string angka dari PHP ("5012") menjadi number (5012) tanpa error')`
- `it('mengonversi array kosong [] dari PHP json_encode menjadi objek record kosong {}')`
