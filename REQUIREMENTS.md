# 📋 Technical & Functional Requirements: `aksaventra-cbt` (Next.js 16 + Moodle mod_cbt)

Dokumen kebutuhan teknis dan fungsional untuk sistem **Aksaventra CBT** yang terintegrasi secara *headless* dengan modul backend Moodle **`mod_cbt`** (`D:\Project\moodle_installer\moodle\mod\cbt`).

---

## 1. Modul Peserta Ujian (Student Exam Portal)

### 1.1 Pre-Flight Check & Ruang Lobi (`/student/lobby/[cbtId]`)
1. **Penerimaan Parameter Moodle (`launch.php`):**
   - Menerima `cbtid`, `cmid`, `launch_token`, dan `moodle_api` dari *handshake redirect* Moodle.
   - Menukar `launch_token` dengan sesi autentikasi CBT di `/api/auth/moodle-launch`.
2. **Pengujian Kesiapan Perangkat (Pre-Flight Checks):**
   - Menguji ketersediaan dan izin penulisan `IndexedDB` (`DexieAttemptVault`).
   - Memeriksa konektivitas jaringan (ping latensi < 1000ms) dan status baterai (bila didukung browser).
   - Validasi header keamanan **Safe Exam Browser (SEB)** (`X-SafeExamBrowser-RequestHash` & `ConfigKey`) jika ujian mewajibkan SEB.
3. **Verifikasi Token Ruang 6-Digit:**
   - Validasi token 6-karakter Base32 (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`) yang dihasilkan oleh `token_generator.php` Moodle.
   - **Sinkronisasi Fullscreen:** Memicu `document.documentElement.requestFullscreen()` secara *synchronous* di dalam event handler klik tombol verifikasi token agar tidak diblokir oleh kebijakan keamanan Safari/Chrome.

### 1.2 Zero-Latency Exam Workspace (`/student/exam/[attemptId]`)
1. **Navigasi Soal Instan (< 16ms / 60fps):**
   - Perpindahan antar nomor soal dieksekusi langsung dari *in-memory Zustand store* (`useExamStore`) tanpa jeda jaringan atau re-render cascading.
2. **Pintasan Keyboard Terisolasi (Hotkeys):**
   - `A`, `B`, `C`, `D`, `E` untuk memilih opsi pilihan ganda.
   - `R` untuk menandai status **Ragu-ragu** (`flag: true`).
   - `Panah Kiri` (soal sebelumnya) dan `Panah Kanan` (soal berikutnya).
   - **Input Isolation Guard:** Hotkeys otomatis dinonaktifkan saat elemen input teks (`shortanswer` atau `essay`) sedang menerima fokus kursor.
3. **Perenderan Rumus Matematika (KaTeX):**
   - Merender sintaks matematika LaTeX inline (`$...$` atau `\(...\)`) dan display (`$$...$$` atau `\[...\]`) menggunakan `katexSanitizer.ts`.
4. **Dukungan Format Soal Moodle:**
   - Mendukung format soal: `multichoice_single`, `multichoice_multi`, `match`, `shortanswer`, `truefalse`, dan `essay`.

### 1.3 Offline-First Storage & Sinkronisasi Berkala
1. **Penyimpanan Lokal Super Cepat (< 5ms):**
   - Setiap klik opsi atau ketikan jawaban langsung tersimpan di IndexedDB (`DexieAttemptVault`) dengan metadata `synced: false` dan `updatedAt: Date.now()`.
2. **Auto-Save dengan Random Jitter (Anti-Thundering Herd):**
   - Sinkronisasi antrean jawaban berjalan setiap 20 detik ditambah *random jitter* acak `0 - 4000ms` (`getNextSyncDelayWithJitter(20000, 4000)`).
   - Payload dikirim ke endpoint Moodle `mod_cbt_sync_batch_answers` dengan format `{ [questionId]: { ans, flag, ts } }`.
3. **Sequential Mutex Barrier:**
   - Tombol **"Kumpulkan Ujian"** dilindungi oleh `AsyncSyncMutex` yang menunggu seluruh request sinkronisasi latar belakang yang sedang *in-flight* selesai sebelum mengirim `mod_cbt_submit_exam`.

---

## 2. Modul Keamanan & Anti-Kecurangan (Quiz Focus Guard)

1. **Hard Security Violation (Toleransi 0ms):**
   - Pindah tab browser (`document.visibilityState === 'hidden'`) atau keluar dari mode fullscreen (`document.fullscreenElement === null`).
   - Langsung melaporkan event `TAB_BLUR` atau `FULLSCREEN_EXIT` ke Moodle `mod_cbt_report_violation` dan menambah `strike_count + 1`.
2. **Soft Blur Grace Period (2.500ms):**
   - Kehilangan fokus jendela (`window.onblur`) tanpa perubahan tab menampilkan banner peringatan `<BlurGraceWarningBanner />` selama 2,5 detik. Bila fokus tidak kembali dalam 2,5 detik, baru dicatat sebagai pelanggaran `TAB_BLUR`.
3. **DevTools Trap:**
   - Deteksi pembukaan Developer Tools / Inspect Element memicu penguncian langsung (`DEVTOOLS_OPEN`) yang otomatis mengunci ujian.
4. **Auto-Lockdown:**
   - Saat akumulasi `strike_count >= max_strikes`, antarmuka terkunci penuh dengan `<LockdownShieldModal />` dan hanya dapat dibuka kembali melalui aksi pengawas di Moodle/Proctor Room.

---

## 3. Modul Ruang Kendali Pengawas (Proctor Command Center)

1. **Matriks Peserta Real-Time (`/dashboard/proctor/[cbtId]`):**
   - Memantau status seluruh peserta dalam ruangan: *In-Progress*, *Locked* (merah), *Submitted* (hijau), serta sisa waktu dan jumlah strike.
2. **Proyektor Token Dinamis (`<TokenProjectorCard />`):**
   - Menampilkan token 6-karakter Base32 aktif dengan hitung mundur waktu rotasi (15 menit) atau opsi manual override.
3. **Aksi Intervensi Pengawas (`mod_cbt_proctor_control`):**
   - **Unlock Strike:** Membuka sesi ujian yang terkunci akibat akumulasi strike (`action: 'unlock'`).
   - **Extend Time (+Menit):** Memberikan tambahan waktu kompensasi kendala teknis (`action: 'extend_time'`).
   - **Force Submit:** Mengumpulkan paksa ujian siswa yang melanggar atau telah selesai (`action: 'force_submit'`).
   - **Reset Device:** Menghapus ikatan *device fingerprint* agar siswa dapat berpindah perangkat ujian cadangan.

---

## 4. Modul Database & Backend-for-Frontend (BFF)

1. **Dual-Database Storage (MariaDB & PostgreSQL):**
   - Skema Prisma v7 (`prisma/schema.prisma`) mendukung koneksi **MariaDB/MySQL** (port 3306) dan **PostgreSQL** (port 5432) dengan adapter `@prisma/adapter-mariadb` dan `@prisma/adapter-pg`.
2. **Moodle Web Service Gateway (`/api/moodle-proxy/[...wsfunction]`):**
   - Meneruskan panggilan API Next.js ke `/webservice/rest/server.php` Moodle secara aman menggunakan token server-to-server.
3. **Penyimpanan Snapshot Soal Lokal:**
   - Menyimpan salinan naskah soal beku (`snapshot_hash`) di database lokal untuk menjamin keandalan saat jaringan server Moodle mengalami kendala.
