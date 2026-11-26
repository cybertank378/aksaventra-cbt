# Aksaventra CBT

Aplikasi Computer-Based Testing (CBT) berbasis Next.js 16 (App Router) dan Prisma v7 yang terintegrasi dua arah dengan Moodle (`mod_cbt`).

## Arsitektur Direktori

- `src/core/`: Fondasi Clean Architecture (`Result`, `BaseEntity`, `BaseUseCase`, `BaseRepository`, `BaseService`, `BaseController`, error handler).
- `src/libs/`: Utilitas inti (Prisma client, sinkronisasi Moodle, verifier password Argon2/Bcrypt/SHA-512, KaTeX sanitizer, offline vault Dexie, generator PDF).
- `src/security/`: Autentikasi JWT server-only (`serverAuth.ts`), RBAC (`rbacConfig.ts`), rate limiter (`rateLimiter.ts`), validasi SEB, dan device fingerprint.
- `src/modules/`: Modul domain & aplikasi (`auth`, `users`, `classes`, `subjects`, `questions`, `exams`, `attempts`, `proctor`, `sync`, `announcements`).
- `src/shared-ui/`: Sistem komponen dasar dan layout (`AppSidebar`, `AppTopbar`, `AppLayout`, `ExamFocusLayout`).
- `src/sections/`: Halaman fitur berbasis Atomic Design (`atoms`, `molecules`, `organisms`, `pages`).
- `src/app/`: Next.js App Router (halaman terlindungi, halaman publik, dan API Route Handlers).
- `src/proxy.ts`: Edge/Proxy middleware untuk verifikasi sesi JWT dan otorisasi RBAC.

## Persiapan Pengembangan

1. Salin `.env.example` menjadi `.env` dan isi kredensial lokal:
   ```bash
   cp .env.example .env
   ```
2. Pasang dependensi dan generate Prisma Client:
   ```bash
   npm install
   npm run prisma:generate
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

## Pemeriksaan Kualitas & Keamanan

- **TypeScript:** `npx tsc --noEmit`
- **Lint & Format (Biome):** `npm run lint` / `npm run format`
- **Unit Test (Vitest):** `npm test`
- **Standar UI & Kode:** Lihat [GEMINI.md](./GEMINI.md) (`antislop-ai`) dan [DESIGN.md](./DESIGN.md).
- **Catatan Keamanan:**
  - Jangan pernah menyimpan berkas `.env` atau folder hasil build (`dist-aksaventra-cbt/`, `.next/`) ke Git.
  - Pastikan `CBT_JWT_SECRET` di produksi minimal 32 karakter acak dan berbeda dari lingkungan pengembangan.
  - Lihat `npm audit --omit=dev` secara berkala untuk memantau kerentanan dependensi.
