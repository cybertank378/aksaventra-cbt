## 1. Identitas & Ruang Lingkup Perubahan (ISO 27001 Annex A.8.32)
- **ID Tiket / Referensi Perubahan:** `[CHG-YYYY-XXX / Issue #]`
- **Commit SHA Terakhir yang Diuji:** `<commit-sha>`
- **Komponen / Layanan Terdampak:** `[misal: Auth Module, API Route /api/..., Prisma Schema]`
- **Jenis Perubahan:** `[ ] Fitur Baru` | `[ ] Perbaikan Bug` | `[ ] Hardening Keamanan` | `[ ] Pembaruan Dependensi`

## 2. Analisis Dampak Keamanan & Risiko
- **Ringkasan Perubahan:**
  [Jelaskan secara singkat apa yang diubah dan tujuannya]
- **Dampak terhadap Kontrol Keamanan & Data:**
  - Mengubah logika autentikasi / otorisasi (`A.5.15`, `A.8.28`)? `[ ] Ya` / `[ ] Tidak`
  - Mengubah skema database atau akses data sensitif (`A.8.12`, `A.8.28`)? `[ ] Ya` / `[ ] Tidak`
  - Menambah/memperbarui paket pihak ketiga (`A.8.8`)? `[ ] Ya` / `[ ] Tidak`
  - Mengubah konfigurasi environment / rahasia (`A.8.31`)? `[ ] Ya` / `[ ] Tidak`
- **Risiko Residual & Mitigasi:**
  [Sebutkan risiko tersisa setelah mitigasi, atau tulis "Tidak ada risiko keamanan baru yang teridentifikasi"]

## 3. Bukti Verifikasi Pipeline & Review (Annex A.8.25, A.8.28, A.8.29)
- **Pipeline / CI Run ID:** `[#Run-ID / Tautan Run pada Commit SHA di atas]`
- **Status Pemeriksaan Teknis:**
  - [ ] Type-check & Linter (`tsc` / `lint`): **PASS**
  - [ ] Unit / Integration & Security Tests (`A.8.29`): **PASS**
  - [ ] Pemeriksaan Kerentanan Dependensi (`A.8.8`): **PASS**
  - [ ] Pemindaian Secret & Konfigurasi (`A.5.17`, `A.8.31`): **PASS**
  - [ ] Security Code Review (`iso27001-security-review`): **PASS / PASS WITH NOTES**

## 4. Rencana Pengujian & Rollback (Annex A.8.32)
- **Langkah Verifikasi Pasca-Merge / Staging:**
  1. [Langkah pengujian fungsional & batas otorisasi]
- **Rencana Rollback:**
  - Revert commit / kembalikan deployment ke release/commit sebelumnya (`<previous-commit-sha-atau-tag>`), lalu verifikasi layanan kembali normal.

## 5. Persetujuan (Approval)
- **Pengusul Perubahan:** `@username`
- **Peninjau & Pemberi Persetujuan:** `@reviewer` *(wajib berbeda dari pengusul untuk perubahan berisiko sedang/tinggi)*