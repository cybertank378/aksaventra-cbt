# Laporan Audit Keamanan & Kapasitas Konkurensi Aksaventra CBT

Laporan ini disusun berdasarkan audit defensif kode sumber pada repositori `aksaventra-cbt` sebagai dasar hardening sistem dan perencanaan kapasitas pengguna konkuren (*concurrent usage*) selama pelaksanaan ujian CBT.

---

## 1. Ringkasan Postur Keamanan Saat Ini

| Area Keamanan | Status | Implementasi Terverifikasi | Catatan Hardening Lanjutan |
| --- | --- | --- | --- |
| **SQL Injection** | Kuat | Seluruh query memakai Prisma ORM terparameterisasi (`src/libs/prisma.ts`, repositori di `src/modules/*/infrastructure/`). | Hindari `$queryRawUnsafe` / `$executeRawUnsafe` pada pengembangan fitur baru. |
| **Autentikasi & Sesi JWT** | Kuat | Cookie `HttpOnly`, `SameSite=Lax`, `Secure` otomatis pada HTTPS (`AuthController.ts`), wajib `CBT_JWT_SECRET` minimal 16 karakter di produksi (`jwtConfig.ts`), tanpa `"use cache"` di `proxy.ts`. | Gunakan secret acak minimal 32 byte (`openssl rand -base64 32`) dan rotasi berkala. |
| **Brute Force Protection** | Baik (Single-Node) | `rateLimiter.ts` membatasi `login` (15 req/5 mnt), `verifyExamToken` (20 req/5 mnt), dan `moodleLaunch` (20 req/5 mnt) dengan respons `429` + `Retry-After`. | Pindahkan penyimpanan bucket rate limit ke Redis jika menjalankan PM2 cluster / multi-instance. |
| **RBAC & Anti-IDOR** | Kuat | `proxy.ts` membersihkan header spoofable `x-user-*`, `serverAuth.ts` memverifikasi JWT langsung, `AttemptController.ts` memverifikasi kepemilikan attempt (`verifyAttemptOwnership`), dan `ProctorController.ts` mengunci 1 Proktor = 1 Ruang (`403 PROCTOR_ROOM_FORBIDDEN`). | Pastikan setiap akun `PROCTOR` memiliki `roomCode` valid sebelum hari ujian. |
| **Upload & Stored XSS** | Kuat | `src/app/api/upload/route.ts` memblokir `image/svg+xml`, membatasi ukuran 5 MB, dan memverifikasi peran `ADMIN`/`TEACHER`. | Tambahkan verifikasi *magic bytes* file gambar selain `file.type` (MIME header klien). |
| **Security Headers** | Kuat | `next.config.ts` menerapkan `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, dan `Permissions-Policy`. | Tambahkan `Strict-Transport-Security` (HSTS) dan `Content-Security-Policy` (CSP) di reverse proxy Nginx/Cloudflare. |
| **Dependensi (`npm audit`)** | Perlu Perhatian | `npm audit --omit=dev` melaporkan 2 kerentanan upstream berisiko tinggi: `xlsx` (Prototype Pollution & ReDoS) dan `effect <=3.22.0` (via `@prisma/config`). | Rencanakan migrasi impor/ekspor Excel dari `xlsx` ke `exceljs` serta pantau pembaruan `prisma`. |

---

## 2. Analisis Kapasitas Pengguna & Concurrent Usage

### A. Profil Beban Kerja Saat Ujian Berlangsung
Berdasarkan arsitektur aplikasi saat ini:
1. **Sinkronisasi Jawaban Siswa (`src/shared/api/apiQueue.ts`):**
   - Interval dasar `20 detik` dengan jitter acak `0-4 detik` (`getNextSyncDelayWithJitter(20_000, 4_000)`), disertai `AsyncSyncMutex` untuk mencegah tumpang tindih request per siswa.
   - Beban stabil: sekitar `0,045 req/detik` per siswa aktif.
   - **500 siswa konkuren** -> sekitar `22-25 req/detik` steady state untuk `/api/attempts/[id]/sync`.
   - **1.000 siswa konkuren** -> sekitar `45-50 req/detik` steady state.
2. **Lonjakan Login & Mulai Ujian (Burst Traffic):**
   - Jika 300-500 siswa menekan login dalam rentang 30 detik yang sama (`10-17 req/detik`), verifikasi password Argon2id (`argon2`) bersifat CPU-intensive (~50-150 ms/verifikasi per core).
   - Rate limiter login saat ini memakai kunci `IP + username` (15 req / 5 menit), sehingga laboratorium sekolah yang berbagi 1 IP publik NAT **tidak saling memblokir** antar siswa selama `username` berbeda.
3. **Monitoring Proktor & Chat Real-Time:**
   - Polling daftar peserta setiap `5 detik` (`useProctorApi.ts`) per proktor.
   - Chat koordinasi memakai **Server-Sent Events (SSE)** (`GET /api/proctor/chat/stream`) dengan 1 koneksi persisten per proktor/guru/admin dan 1 query cek `timeClose` setiap 25 detik.

### B. Bottleneck Teridentifikasi pada Konfigurasi Saat Ini

| Komponen | Lokasi Kode | Kondisi Saat Ini | Dampak pada Konkurensi Tinggi | Rekomendasi Hardening |
| --- | --- | --- | --- | --- |
| **Database Connection Pool** | `src/libs/prisma.ts:40-47` | Memakai default driver (`connectionLimit: 10` di MariaDB, `max: 10` di PostgreSQL). | Antrean query (*pool exhaustion*) saat >200 siswa login atau submit bersamaan. | Konfigurasi `connectionLimit` / `max` via env (`DB_POOL_MAX=30-50`), `acquireTimeout: 10000`, dan pastikan `max_connections` DB >= `200`. |
| **In-Memory Rate Limiter & Chat Store** | `src/security/rateLimiter.ts`, `ProctorChatStore.ts` | State disimpan di memori proses Node.js (`Map` / `globalThis`). | Aman untuk 1 proses Node.js (PM2 `fork`), tetapi tidak tersinkronisasi jika memakai PM2 `cluster` atau >1 server. | Jalankan 1 instance Node.js per server hingga ~500 siswa, atau migrasikan rate limiter & pub/sub SSE ke **Redis** untuk skala >1.000 siswa / multi-node. |
| **Query Peserta Proktor** | `src/modules/proctor/infrastructure/ProctorRepository.ts:62-95` | Memuat seluruh `attempt` ujian lalu memfilter `roomCode` di memori Node.js. | Beban memori & DB meningkat jika 1 ujian memiliki >1.000 attempt dan banyak proktor polling tiap 5 detik. | Simpan `roomCode` dan `seatNumber` di kolom terpisah atau tambahkan filter `startsWith` di query Prisma + cache singkat 2-3 detik. |
| **Reverse Proxy SSE & Timeout** | Nginx / Cloudflare di depan Next.js | SSE membutuhkan koneksi terbuka lama tanpa buffering. | Koneksi chat real-time terputus jika proxy membuffer atau memutus koneksi idle < 60 detik. | Pastikan header `proxy_buffering off;`, `proxy_read_timeout 3600s;`, dan HTTP/2 aktif pada Nginx untuk `/api/proctor/chat/stream`. |

### C. Estimasi Kapasitas & Rekomendasi Spesifikasi Server

| Skala Siswa Konkuren | Rekomendasi Server Aplikasi (Next.js) | Rekomendasi Database (MariaDB / PostgreSQL) | Pengaturan Pool & Proses |
| --- | --- | --- | --- |
| **<= 200 siswa** (5-8 ruang) | 2 vCPU, 4 GB RAM | 2 vCPU, 4 GB RAM (`max_connections=150`) | PM2 `fork` (1 proses), `DB_POOL_MAX=20` |
| **200 - 500 siswa** (10-18 ruang) | 4 vCPU, 8 GB RAM | 4 vCPU, 8 GB RAM (`max_connections=300`) | PM2 `fork` (1 proses) atau 2 worker + Redis, `DB_POOL_MAX=40` |
| **500 - 1.500 siswa** (20-50 ruang) | 8 vCPU, 16 GB RAM (atau 2 node di belakang load balancer) | Dedicated DB 8 vCPU, 16 GB RAM (`max_connections=500` + PgBouncer/ProxySQL) | PM2 `cluster` + **Redis** (rate limit + SSE pub/sub), `DB_POOL_MAX=25` per worker |

---

## 3. Checklist Hardening & Pengujian Defensif yang Disarankan

1. **Pengujian Otomatis Berbasis Unit & Integration Test (Vitest):**
   - Uji `rateLimiter.ts`: verifikasi permintaan ke-16 dalam 5 menit mengembalikan `allowed: false` dan `retryAfterSeconds > 0`.
   - Uji `ProctorController.ts`: verifikasi `PROCTOR` ruang `LAB-01` menerima `403 PROCTOR_ROOM_FORBIDDEN` saat mengakses peserta atau melakukan aksi pada ruang `LAB-02`.
   - Uji `AttemptController.ts`: verifikasi siswa A menerima `403 FORBIDDEN` saat mengirim `sync`/`submit` pada `attemptId` milik siswa B.
   - Uji `/api/upload`: verifikasi `image/svg+xml` dan pengguna `STUDENT` ditolak (`400` / `403`).
2. **Load Testing Terkendali (Staging / Lingkungan Uji Lokal):**
   - Gunakan alat benchmark performa standar seperti **k6** atau **Artillery** pada server staging (bukan produksi) untuk mensimulasikan:
     - Ramp-up 200-500 pengguna virtual pada `/api/health`, `/api/student/exams`, dan `/api/attempts/[id]/sync` dengan interval 20-24 detik.
     - Pantau metrik p95 latency (< 300 ms), error rate (< 0,1%), CPU Argon2 saat login burst, serta utilisasi koneksi DB.
3. **Prioritas Hardening Berikutnya (Backlog):**
   - [ ] Tambahkan konfigurasi `DB_POOL_MAX` dan `acquireTimeout` pada `src/libs/prisma.ts`.
   - [ ] Tambahkan validasi *magic bytes* pada `src/app/api/upload/route.ts`.
   - [ ] Migrasi impor/ekspor spreadsheet dari `xlsx` ke `exceljs` untuk menutup advisory `npm audit`.
   - [ ] Tambahkan adapter Redis opsional (`REDIS_URL`) untuk `rateLimiter.ts` dan `ProctorChatStore.ts` guna mendukung deployment multi-instance / PM2 cluster.
   - [ ] Terapkan header `HSTS` dan `CSP` di konfigurasi reverse proxy produksi.
