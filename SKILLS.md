# 🛠️ Technical Skills & Implementation Patterns: `aksaventra-cbt` (Next.js 16 + Moodle mod_cbt)

Dokumen panduan kompetensi dan pola implementasi teknis untuk pengembangan sistem **Aksaventra CBT** yang selaras dengan modul backend Moodle **`mod_cbt`** (`D:\Project\moodle_installer\moodle\mod\cbt`).

---

## 1. Integrasi Moodle Headless Web Service (`mod_cbt_*`)
- **External Web Service Client:** Berkomunikasi dengan Moodle REST API (`/webservice/rest/server.php`) menggunakan token server terisolasi.
- **Strict Payload Mapping:** Memetakan DTO Next.js ke parameter Moodle:
  - `mod_cbt_get_exam_manifest` -> Meminta snapshot soal terkompresi tanpa kunci jawaban.
  - `mod_cbt_sync_batch_answers` -> Mengirim antrean batch jawaban berformat JSON map `{ [qid]: { ans, flag, ts } }`.
  - `mod_cbt_report_violation` -> Melaporkan event pelanggaran (`TAB_BLUR`, `FULLSCREEN_EXIT`, `DEVTOOLS_OPEN`).
  - `mod_cbt_submit_exam` -> Meminta kalkulasi nilai akhir in-memory dan pencatatan gradebook.
  - `mod_cbt_proctor_control` -> Mengirim perintah pengawas (`unlock`, `extend_time`, `force_submit`).
- **One-Time Launch Handshake:** Memvalidasi `launch_token` dari `mod/cbt/launch.php` pada route `/api/auth/moodle-launch`.

---

## 2. Penyimpanan Klien Offline-First & Mutex Barrier
- **Dexie.js IndexedDB Vault (< 5ms Write):** Menyimpan status jawaban lokal siswa secara instan ke tabel IndexedDB tanpa memblokir thread UI.
- **Random Jitter Scheduling (Anti-Thundering Herd):** Menerapkan jeda acak `20000ms + (0 - 4000ms)` pada setiap siklus sinkronisasi berkala untuk mencegah 500+ request serentak ke server.
- **Async Sync Mutex Barrier:** Menggunakan `AsyncSyncMutex` agar tombol Final Submit menunggu antrean *in-flight background sync* selesai secara sekuensial, mencegah race condition hilangnya jawaban terakhir.

---

## 3. Sinkronisasi Waktu Server Monotonik (`ServerDeltaTimer`)
- **Server Clock Calibration:** Menghitung selisih waktu (`delta = serverTime - clientLocalTime`) pada handshake pertama.
- **Monotonic Protection:** Menggunakan `performance.now()` untuk menghitung sisa waktu ujian agar aman dari manipulasi jam OS lokal siswa atau penundaan background tab.

---

## 4. Keamanan Layar & Anti-Kecurangan (`quizFocusGuard.ts`)
- **Fullscreen Gesture Synchronous Handler:** Memicu `requestFullscreen()` di dalam user-gesture handler asli untuk kompatibilitas penuh WebKit/Safari.
- **Zero-Tolerance Hard Strike:** Deteksi instan pada `document.visibilityState === 'hidden'` dan keluar dari mode fullscreen.
- **Soft Blur Grace Period:** Pengatur waktu tunda 2,5 detik pada `window.onblur` untuk menyaring interaksi OS yang tidak disengaja (misal notifikasi sistem).
- **Anti-DevTools Trap:** Deteksi debugger breakpoint dan manipulasi ukuran window yang mencurigakan.

---

## 5. Render Rumus Matematika Aman (KaTeX)
- **Math LaTeX Sanitizer:** Memproses notasi `$`, `$$`, `\(`, `\[` menjadi tag HTML KaTeX yang telah disanitasi menggunakan DOMPurify untuk mencegah serangan XSS melalui stimulus soal Moodle.

---

## 6. Dual-Database Storage Architecture (Prisma v7)
- **Multi-Driver Adapter:** Mengelola koneksi relasional dengan `@prisma/adapter-mariadb` (`mariadb.createPool`) untuk mode **MariaDB/MySQL** dan `@prisma/adapter-pg` (`pg.Pool`) untuk mode **PostgreSQL**.
- **CLI Mode Switcher (`scripts/switch-db-mode.mjs`):** Memastikan skema Prisma aktif selaras dengan mode database yang digunakan.
