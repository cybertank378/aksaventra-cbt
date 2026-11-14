# 🚪 ISSUE-10: Implementasi Section `src/sections/auth/` & `src/sections/student-lobby/`

- **ID Issue:** `ISSUE-10`
- **Fase:** `3 - Shared UI & Atomic Sections`
- **Prioritas:** `P1 (High)`
- **Bergantung Pada:** `ISSUE-05`, `ISSUE-06`, `ISSUE-09`
- **File Target (Sesuai Struktur Project):**
  - `src/sections/auth/atoms/TokenPinInput.tsx`
  - `src/sections/auth/organisms/LoginForm.tsx`
  - `src/sections/auth/pages/AuthSection.tsx`
  - `src/sections/student-lobby/molecules/DevicePreFlightCard.tsx`
  - `src/sections/student-lobby/molecules/TokenVerificationCard.tsx`
  - `src/sections/student-lobby/organisms/StudentLobbyView.tsx`
  - `src/sections/student-lobby/pages/StudentLobbySection.tsx`
  - `src/app/(public)/login/page.tsx`
  - `src/app/(protected)/student/lobby/[examId]/page.tsx`

## 1. Deskripsi Tugas
1. **`DevicePreFlightCard.tsx`:** Menampilkan hasil pemeriksaan kesiapan perangkat secara otomatis:
   - Status Penyimpanan Offline (`IndexedDB` write/read check via `dexieVault.ts`).
   - Status Koneksi Server & Sinkronisasi Waktu.
   - Status Safe Exam Browser (SEB) jika ujian mewajibkan SEB.
2. **`TokenVerificationCard.tsx`:** Saat tombol **"Masuk Layar Penuh & Mulai Ujian"** diklik, memanggil `enterExamFullscreenSafe()` secara sinkron pada baris pertama *event handler* sebelum memanggil API verifikasi token 6-digit.
