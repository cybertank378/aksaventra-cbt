# 🌐 ISSUE-NET-03: Waktu Ujian Habis (`remainingSeconds === 0`) Saat Koneksi Wi-Fi / LAN Sekolah Terputus Total

- **ID Issue:** `ISSUE-NET-03`
- **Prioritas:** `P1 (High)`
- **Modul & File Terdampak:**
  - `src/modules/attempts/application/usecases/SubmitAttemptUseCase.ts`
  - `src/sections/exam-workspace/organisms/OfflineReceiptModal.tsx`

## 1. Akar Masalah (Root Cause)
Ketika waktu habis, sistem wajib menghentikan pengerjaan dan mengirim jawaban akhir. Namun jika pada saat yang sama *switch* jaringan ruang ujian mati atau Wi-Fi terputus, *request* pengumpulan gagal terkirim. Jika siswa menutup browser, bukti pengerjaan tepat waktu dapat hilang.

## 2. Strategi Mitigasi Teknis (Sealed Offline Receipt & Exponential Backoff)
1. **Immediate Input Freeze:** Begitu `remainingSeconds === 0`, ubah state menjadi `TIME_UP_SEALING` (seluruh opsi soal dikunci secara permanen di UI dan IndexedDB).
2. **Exponential Backoff Auto-Retry:** Jalankan percobaan kirim ulang otomatis (`2s -> 4s -> 8s -> 15s...`) di latar belakang begitu event `window.ononline` terdeteksi.
3. **Cryptographic Offline Receipt:** Tampilkan `<OfflineReceiptModal />` yang memuat bukti JSON jawaban yang disegel dengan *SHA-256 Digest* dalam bentuk kode teks/QR dan tombol **Unduh Bukti Jawaban (`.aksaventra-receipt`)** untuk diserahkan ke Proktor jika jaringan sekolah mati total.

## 3. Cakupan Unit Test Wajib (`tests/unit/usecases/OfflineReceiptSubmit.test.ts`)
- `it('mengunci perubahan jawaban baru setelah status berpindah ke TIME_UP_SEALING')`
- `it('menghasilkan payload receipt dengan hash integritas SHA-256 yang konsisten saat submit gagal karena jaringan')`
