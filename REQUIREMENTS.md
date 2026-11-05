# 📋 Technical & Functional Requirements: `aksaventra-cbt` (Next.js 16)

## 1. Modul Peserta Ujian (`src/modules/attempts` & `src/sections/exam-workspace`)
1. **Lobby & Pre-Flight Check (`/student/lobby/[examId]`):**
   - Menguji ketersediaan `IndexedDB` (`dexieVault.ts`), status jaringan, dan header **Safe Exam Browser (SEB)** (`src/security/sebHeaderValidator.ts`).
   - Memicu `requestFullscreen()` secara sinkron pada klik tombol verifikasi token 6-digit.
2. **Zero-Latency Exam Workspace (`/student/exam/[attemptId]`):**
   - Perpindahan soal `< 16ms` menggunakan state terisolasi di `useExamWorkspaceStore.ts`.
   - Pintasan keyboard (`A-E`, `R` untuk Ragu-ragu, Panah Kiri/Kanan) yang otomatis nonaktif bila fokus berada di elemen input jawaban singkat.
   - Perenderan rumus matematika menggunakan `src/libs/katexSanitizer.ts`.
3. **Offline-First Sync (`DexieAttemptVault.ts` & `SyncAnswerQueueUseCase.ts`):**
   - Simpan jawaban ke IndexedDB dalam `< 5ms` dan sinkronkan ke `/api/attempts/[id]/sync` setiap 20 detik + *random jitter* `0-4000ms`.

## 2. Modul Keamanan & Anti-Kecurangan (`src/security/quizFocusGuard.ts`)
- **Hard Strike (0ms):** Pindah tab (`document.hidden === true`) atau keluar dari mode *fullscreen*.
- **Soft Blur Grace Period (2.500ms):** Kehilangan fokus jendela (`window.onblur`) menampilkan `<BlurGraceWarningBanner />` selama 2,5 detik sebelum dihitung sebagai *strike*.
- **Auto-Lockdown:** Menampilkan `<LockdownShieldModal />` saat `strikeCount >= maxStrikes`.

## 3. Modul Ruang Pengawas (`src/modules/proctor` & `src/sections/proctor-room`)
- Pantauan langsung matriks peserta (`/dashboard/proctor/[examId]`), layar proyektor Token Dinamis (`<TokenProjectorCard />`), serta aksi **Unlock Strike**, **Reset Device**, **Extend Time (+Menit)**, dan **Force Submit**.
