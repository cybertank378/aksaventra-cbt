# 🖥️ ISSUE-11: Implementasi Section `src/sections/exam-workspace/` (Zero-Latency Workspace)

- **ID Issue:** `ISSUE-11`
- **Fase:** `3 - Shared UI & Atomic Sections`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-07`, `ISSUE-09`, `ISSUE-10`
- **File Target (Sesuai Struktur Project):**
  - `src/sections/exam-workspace/atoms/FontSizeToggle.tsx`
  - `src/sections/exam-workspace/atoms/QuestionNumberButton.tsx`
  - `src/sections/exam-workspace/atoms/ServerTimerBadge.tsx`
  - `src/sections/exam-workspace/atoms/SyncStatusBadge.tsx`
  - `src/sections/exam-workspace/molecules/QuestionNavGrid.tsx`
  - `src/sections/exam-workspace/molecules/QuestionStemRenderer.tsx`
  - `src/sections/exam-workspace/molecules/BlurGraceWarningBanner.tsx`
  - `src/sections/exam-workspace/organisms/QuestionCanvas.tsx`
  - `src/sections/exam-workspace/organisms/LockdownShieldModal.tsx`
  - `src/sections/exam-workspace/organisms/OfflineReceiptModal.tsx`
  - `src/sections/exam-workspace/pages/ExamWorkspaceSection.tsx`
  - `src/app/(protected)/student/exam/[attemptId]/page.tsx`

## 1. Deskripsi Tugas
1. **`ServerTimerBadge.tsx`:** Mengisolasi state detik hitung mundur di dalam komponen ini sendiri menggunakan `calculateTrueRemainingSeconds()` sehingga `<QuestionCanvas />` dan `<QuestionNavGrid />` **tidak pernah mengalami re-render** saat detik berubah.
2. **`QuestionCanvas.tsx`:** Merender soal aktif dengan `QuestionStemRenderer` (KaTeX + DOMPurify memoized), tombol pengubah ukuran huruf (`sm`, `base`, `lg`, `xl`), tombol **Ragu-ragu** berwarna Amber/Gold, serta pintasan keyboard (`A-E`, `R`, Panah Kiri/Kanan).
3. **`LockdownShieldModal.tsx`:** Layar pengunci penuh ketika `status === 'LOCKED'` yang menjalankan *heartbeat polling* setiap 5 detik untuk mendeteksi kapan Pengawas menekan tombol **Unlock Strike** dari ruang proktor.
4. **`OfflineReceiptModal.tsx`:** Muncul otomatis jika waktu ujian habis (`remainingSeconds === 0`) ketika koneksi jaringan sekolah terputus, menampilkan segel bukti jawaban SHA-256 dan tombol unduh `.aksaventra-receipt`.
