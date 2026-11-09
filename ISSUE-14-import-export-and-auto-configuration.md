# [Feature] Import/Export Excel (Siswa, Bank Soal 8 Jenis, Rekap Nilai), Template Unduhan Publik, dan Auto-Configuration Moodle Headless Bridge

## 📌 Deskripsi Kebutuhan Fungsional

Issue ini mengatur implementasi antarmuka frontend **Next.js (`aksaventra-cbt`)** untuk fitur **Import & Export Massal** berbasis **Microsoft Excel/CSV**, penyediaan **Template Unduhan Publik**, serta pemanfaatan **Auto-Configuration Moodle Headless Bridge** yang telah terintegrasi di backend `mod_cbt`.

---

## 🎯 Lingkup Pekerjaan (Scope of Work)

### 1. 👥 Import & Export Siswa dan Kelompok Kelas (`/dashboard/students` & `/dashboard/classes`)
- **Unduh Template Excel Siswa:**
  - Tombol *"Unduh Template Siswa"* yang mengarahkan unduhan ke URL statis publik `/templates/sample_import_siswa.csv`.
  - Format template Excel: UTF-8 BOM dengan pemisah titik-koma (`;`), kolom: `nis_username;nama_lengkap;password;kelas;ruang_ujian;nomor_meja;email`.
- **Modal Upload & Import Siswa:**
  - Komponen drag-and-drop file upload (`.xlsx`, `.csv`).
  - Parsing client-side preview sebelum konfirmasi pengiriman.
  - Pengiriman payload ke backend melalui endpoint `mod_cbt_import_export` (`action: "import_students"`).
  - Menampilkan laporan hasil import: jumlah berhasil diimpor, daftar error/peringatan jika ada duplikasi NIS atau format tidak valid.
- **Ekspor Daftar Siswa:**
  - Tombol *"Export Siswa (Excel)"* untuk mengekspor data siswa per kelas atau keseluruhan ke file `.csv` kompatibel Microsoft Excel.

---

### 2. 📝 Import & Bank Soal Seluruh 8 Jenis Soal (`/dashboard/exams/[id]/questions`)
- **Unduh Template Soal Lengkap:**
  - Tombol *"Unduh Template Soal"* yang mengarahkan ke `/templates/sample_import_soal.csv`.
  - Format template memuat contoh nyata untuk **8 jenis soal**:
    1. `multichoice_single` (Pilihan Ganda 1 Jawaban Benar)
    2. `multichoice_multi` (Pilihan Ganda Kompleks / Lebih dari 1 Jawaban Benar, e.g. `A,C,E`)
    3. `truefalse` (Benar/Salah)
    4. `shortanswer` (Isian Singkat)
    5. `numerical` (Hitungan Numerik dengan batas toleransi error)
    6. `match` (Menjodohkan / Pasangan Jawaban)
    7. `gapselect` (Menjodohkan Dropdown / Teks Rumpang `[[1]]`, `[[2]]`)
    8. `essay` (Esai / Uraian manual grading)
- **Modal Import Soal:**
  - Upload file naskah soal.
  - Validasi teks soal, bobot, opsi A-E, dan kunci jawaban.
  - Pengiriman payload ke `mod_cbt_import_export` (`action: "import_questions"`).
  - Otomatis memicu regenerasi snapshot beku pada cache Moodle (MUC).

---

### 3. 📊 Export Rekapitulasi Nilai & Integritas (`/dashboard/exams/[id]/recapitulation`)
- **Tombol Export Hasil Ujian ke Excel:**
  - Tombol *"Export Rekap Nilai (Excel)"* dengan pemanggilan action `export_results`.
  - Mengunduh file `.csv` dengan header UTF-8 BOM sehingga langsung terbuka rapi dalam kolom-kolom terpisah di Microsoft Excel tanpa teks bertumpuk di kolom A.
  - Data yang diekspor mencakup:
    * Nomor Meja
    * Ruang Ujian
    * NIS / Username
    * Nama Lengkap Siswa
    * Status Ujian (`submitted`, `locked`, `inprogress`)
    * Waktu Mulai & Waktu Selesai
    * Durasi Pengerjaan (Menit)
    * Jumlah Pelanggaran / Strikes
    * Nilai Akhir
    * Nilai Maksimal
    * Status Kelulusan (*Lulus*, *Belum Lulus*, *Diskualifikasi / Terkunci*)

---

### 4. ⚙️ Integrasi Zero-Config Headless Moodle Bridge
- Aplikasi Next.js membaca parameter koneksi otomatis dari `.env`:
  ```env
  NEXT_PUBLIC_MOODLE_URL="http://192.168.0.4:8080"
  MOODLE_WS_ENDPOINT="http://192.168.0.4:8080/webservice/rest/server.php"
  MOODLE_WS_TOKEN="f0e4cae818c6e58419f2f11865010d2b050762e45664b9cc"
  NEXT_PUBLIC_DEFAULT_CBT_ID="1"
  ```
- Seluruh permintaan HTTP dari browser ke Moodle di-proxy melalui Next.js API Route (`/api/moodle-proxy/*`) dengan keamanan token tersembunyi di sisi server.

---

## ✅ Kriteria Keberterimaan (Acceptance Criteria)

- [ ] Template `sample_import_siswa.csv`, `sample_import_soal.csv`, dan `sample_rekap_nilai.csv` dapat diunduh langsung dari `public/templates/`.
- [ ] Upload file CSV/Excel siswa berhasil mendaftarkan akun siswa dan kelas ke Moodle tanpa kendala.
- [ ] Upload file CSV soal mencakup ke-8 jenis soal terproses sempurna ke bank soal ujian.
- [ ] Rekap nilai ujian dapat diunduh dalam format CSV Excel dan terbuka rapi di Microsoft Excel.
- [ ] Admin / Guru tidak perlu melakukan konfigurasi manual apapun di panel Moodle berkat auto-configuration engine.
