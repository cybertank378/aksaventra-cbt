# 🛡️ ISSUE-04: Implementasi `src/security/` & Middleware `src/proxy.ts`

- **ID Issue:** `ISSUE-04`
- **Fase:** `1 - Database & Core Foundation`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-02`, `ISSUE-03`
- **File Target (Sesuai Struktur Project):**
  - `src/security/sebHeaderValidator.ts`
  - `src/security/quizFocusGuard.ts`
  - `src/security/deviceFingerprint.ts`
  - `src/security/rbacConfig.ts`
  - `src/security/sidebarMenu.ts`
  - `src/proxy.ts`

## 1. Deskripsi Tugas
1. **`sebHeaderValidator.ts`:** Memvalidasi header kriptografi `X-SafeExamBrowser-RequestHash` dan `X-SafeExamBrowser-ConfigKeyHash` menggunakan perbandingan `timingSafeEqual` SHA-256 di sisi server.
2. **`quizFocusGuard.ts`:** Utilitas browser untuk masuk ke mode layar penuh secara sinkron (`enterExamFullscreenSafe()`), mendeteksi keluarnya *fullscreen*, memblokir klik kanan/`copy`/`paste`/DevTools shortcut, serta memeriksa apakah kursor sedang berada di kolom `<input>` soal isian singkat (`shouldIgnoreExamShortcut()`).
3. **`deviceFingerprint.ts`:** Menghasilkan hash perangkat yang konsisten untuk pengikatan sesi tunggal (*Single-Device Session Binding*).
4. **`rbacConfig.ts` & `src/proxy.ts`:** Melindungi rute `/dashboard/*` (hanya `ADMIN`, `TEACHER`, `PROCTOR`) dan `/student/*` (hanya `STUDENT` terautentikasi dengan token JWT `jose` yang valid).

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/security/sebHeaderValidator.test.ts` lulus pengujian hash valid dan menolak *spoofed User-Agent*.
- [ ] `tests/unit/security/quizFocusGuard.test.ts` lulus pengujian pengabaian shortcut huruf `A-E` dan `R` saat mengetik di `HTMLInputElement`.
