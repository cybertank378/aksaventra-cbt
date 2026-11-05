# ⚡ ISSUE-PERF-01: *Re-render Cascade* Setiap Detik Akibat Countdown Timer yang Mengganggu Kelancaran 60fps

- **ID Issue:** `ISSUE-PERF-01`
- **Prioritas:** `P1 (High)`
- **Modul & File Terdampak:**
  - `src/sections/exam-workspace/atoms/ServerTimerBadge.tsx`
  - `src/sections/exam-workspace/organisms/QuestionCanvas.tsx`
  - `src/modules/attempts/presentation/useExamWorkspaceStore.ts`

## 1. Akar Masalah (Root Cause)
Jika variabel `remainingSeconds` disimpan di dalam *global store* (`useExamWorkspaceStore`) dan diperbarui setiap 1.000ms, maka seluruh komponen yang berlangganan (*subscribe*) ke store tersebut—termasuk `<QuestionCanvas />` yang merender rumus matematika KaTeX dan `<QuestionNavGrid />` yang merender 50+ tombol nomor soal—akan mengalami *re-render* setiap detik. Hal ini melanggar target `< 16ms` dan menguras baterai perangkat siswa.

## 2. Strategi Mitigasi Teknis (Selector Isolation & Local Timer State)
1. `useExamWorkspaceStore` **DILARANG** menyimpan state `remainingSeconds` yang berubah tiap detik. Store hanya menyimpan `timeAnchor` (`serverTimestampSecAtSync`, `performanceNowMsAtSync`) dan `deadlineServerSec`.
2. Komponen `<ServerTimerBadge />` menghitung sisa detik secara terisolasi di dalam *local state* miliknya sendiri menggunakan `src/libs/serverDeltaTimer.ts`.
3. Komponen `<QuestionCanvas />` dan `<QuestionNavGrid />` menggunakan *atomic selector* Zustand sehingga mengalami **0 kali *re-render*** saat detik berjalan.

## 3. Cakupan Unit Test Wajib (`tests/unit/components/TimerIsolation.test.tsx`)
- `it('tidak memicu re-render pada QuestionCanvas ketika ServerTimerBadge berdetak selama 10 detik')`
