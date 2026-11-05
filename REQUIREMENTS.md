# 📋 Technical & Functional Requirements: `aksaventra-cbt-ui` (Next.js 16)

## 1. Spesifikasi Fungsional Modul Siswa (Student Exam Portal)
1. **Pre-Flight Check & Token Lobby (`/lobby/[cbtId]`):**
   - Memeriksa dukungan `IndexedDB`, status jaringan, dan validasi header **Safe Exam Browser (SEB)**.
   - Memicu `document.documentElement.requestFullscreen()` secara sinkron saat validasi Token 6-Digit.
2. **Zero-Latency Workspace (`/exam/[attemptId]`):**
   - Navigasi antar nomor soal wajib berjalan di bawah **16ms (60fps)** murni dari *memory state* (`useExamStore`).
   - Pintasan *keyboard* penuh: Panah Kiri/Kanan, `A/B/C/D/E` untuk opsi, dan `R` untuk **Ragu-ragu** (otomatis dinonaktifkan saat fokus berada pada input teks `shortanswer`).
   - Render rumus matematika LaTeX menggunakan **KaTeX**.
3. **Offline-First Answer Vault (`DexieExamVault`):**
   - Penyimpanan instan ke `IndexedDB` (`< 5ms`) dan *Background Sync* setiap 20 detik dengan *random jitter* `0 - 4000ms`.

## 2. Spesifikasi Keamanan Klien (Quiz Guard & Anti-Cheat)
- Deteksi `visibilitychange` (0ms toleransi), `window.onblur` (dengan *grace period* 2.5 detik selama dokumen masih terlihat), dan `fullscreenchange`.
- Penguncian otomatis `<LockdownShieldModal />` saat `strikeCount >= maxStrikes`.

## 3. Spesifikasi Dashboard Pengawas (`/proctor/[cbtId]`)
- Statistik & matriks peserta *real-time*, generator Token Ruang, fitur **Unlock Strike**, **Reset Device**, **Tambah Waktu (+Menit)**, dan **Force Submit**.
