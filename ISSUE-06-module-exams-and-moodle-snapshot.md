# 📦 ISSUE-06: Implementasi Modul `src/modules/exams/` & Proxy Snapshot Moodle

- **ID Issue:** `ISSUE-06`
- **Fase:** `2 - Domain & Application Modules`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-01`, `ISSUE-02`, `ISSUE-05`
- **File Target (Sesuai Struktur Project):**
  - `src/modules/exams/domain/dto/ExamSnapshotDTO.ts`
  - `src/modules/exams/domain/entities/ExamEntity.ts`
  - `src/modules/exams/domain/entities/QuestionItemEntity.ts`
  - `src/modules/exams/domain/interfaces/ExamRepositoryInterface.ts`
  - `src/modules/exams/application/usecases/GetExamSnapshotUseCase.ts`
  - `src/modules/exams/application/usecases/CreateExamUseCase.ts`
  - `src/modules/exams/application/usecases/UpdateExamUseCase.ts`
  - `src/modules/exams/application/ExamService.ts`
  - `src/modules/exams/infrastructure/ExamRepository.ts`
  - `src/modules/exams/infrastructure/exam.validator.ts`
  - `src/modules/exams/infrastructure/ExamController.ts`
  - `src/modules/exams/presentation/useExamApi.ts`
  - `src/app/api/exams/_factory.ts`
  - `src/app/api/exams/route.ts`
  - `src/app/api/exams/[id]/route.ts`
  - `src/app/api/exams/[id]/snapshot/route.ts`
  - `src/app/api/moodle-proxy/[...wsfunction]/route.ts`

## 1. Deskripsi Tugas
1. Membangun validator defensif di `exam.validator.ts` (`z.coerce.number()`) untuk menangani payload JSON dari PHP Moodle.
2. Memastikan `GetExamSnapshotUseCase.ts` **hanya** mengembalikan `questionsJson` yang sudah bersih dari kunci jawaban (`answerKeysJson` tidak pernah keluar dari lapisan server).
3. Menyediakan *In-Memory LRU/TTL Cache* pada `/api/exams/[id]/snapshot/route.ts` sehingga ketika 500 siswa mengambil naskah soal secara bersamaan di detik pertama ujian, database PostgreSQL hanya diakses 1 kali.

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/modules/exams/GetExamSnapshotUseCase.test.ts` memastikan properti kunci jawaban tidak pernah bocor ke DTO klien.
- [ ] `tests/unit/modules/exams/exam.validator.test.ts` lulus pengujian konversi tipe data JSON Moodle.
