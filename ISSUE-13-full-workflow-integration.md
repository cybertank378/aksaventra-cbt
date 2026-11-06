## 📌 Deskripsi Kebutuhan Fungsional (Workflow End-to-End)

Issue ini mengatur implementasi antarmuka frontend **Next.js (`aksaventra-cbt`)** yang terhubung secara seragam dan *real-time* ke backend **Moodle (`mod_cbt`)** untuk mencakup siklus lengkap pelaksanaan ujian CBT:

---

### 1. 📅 Fase Persiapan Ujian (Guru / Admin di Next.js)
Guru atau Admin memasukkan seluruh data pelaksanaan ujian secara mandiri dari antarmuka Next.js:
- **Jadwal Ujian (`/dashboard/exams/new` & `/dashboard/exams/[id]/edit`):**
  - Input nama ujian, mata pelajaran, tanggal & jam mulai/selesai, durasi pengerjaan, batas strike pelanggaran, dan token ruangan.
  - Tersinkronisasi dua arah ke Moodle `mdl_cbt` melalui Web Service `mod_cbt_manage_schedule`.
- **Peserta Ujian & Nomor Meja Ujian (`/dashboard/exams/[id]/participants`):**
  - Mendaftarkan peserta ujian (NIS/Username, Nama Lengkap, Kelas).
  - Mengalokasikan **Ruang Ujian** (misal: `LAB-01`) dan **Nomor Meja Ujian** (misal: `M-01`, `M-02`, dst.) per siswa.
  - Tersimpan ke tabel Moodle `cbt_roster` melalui Web Service `mod_cbt_manage_roster`.
- **Bank Soal & Butir Soal (`/dashboard/exams/[id]/questions`):**
  - Mengelola butir soal mencakup 8 jenis pertanyaan: Pilihan Ganda Biasa, Pilihan Ganda Kompleks (MCMA), Benar/Salah, Isian Singkat, Numerik (dengan batas toleransi), Menjodohkan, Teks Rumpang, dan Esai.
  - Snapshot naskah beku otomatis ter-cache di Moodle Universal Cache (MUC).

---

### 2. 🛡️ Fase Pelaksanaan Ujian (Siswa & Proktor di Next.js)
- **Portal Ujian Siswa (`/student/lobby/[cbtId]` & `/student/exam/[attemptId]`):**
  - Siswa login menggunakan akun yang telah didaftarkan.
  - Sistem menampilkan nomor meja dan data sesi, siswa memasukkan token 6-digit untuk membuka soal ujian.
  - Pengerjaan offline-first (IndexedDB) dengan sinkronisasi batch berkala ke server.
- **Deteksi Kecurangan & Auto-Lock:**
  - Saat siswa melakukan kecurangan (pindah tab, keluar fullscreen, membuka DevTools), sistem otomatis mencatat pelanggaran dan **seketika memblokir siswa** (`status: LOCKED`) dengan tampilan layar perisai (`<LockdownShieldModal />`).
- **Live Proctor Command Center (`/dashboard/proctor/[cbtId]`):**
  - Proktor memantau matriks seluruh peserta di ruangan dengan denah nomor meja secara real-time via `mod_cbt_get_proctor_stream`.
  - Notifikasi instan (*Live Violation Alert*) muncul di layar proktor saat siswa melakukan pelanggaran.
  - **Aksi Kendali Proktor (`mod_cbt_proctor_control`):**
    - **Blokir Manual (`lock`):** Proktor memblokir siswa secara manual jika ketahuan mencontek secara fisik di ruangan.
    - **Buka Blokir (`unlock`):** Proktor memiliki kuasa penuh membuka blokir siswa dengan 1 klik jika terbukti tidak curang atau terjadi *false alarm*. Status dikembalikan ke `IN_PROGRESS`, strike di-reset ke 0, dan siswa langsung dapat melanjutkan ujian.
    - **Tambah Waktu (`extend_time`):** Menambah durasi waktu kompensasi kendala perangkat.
    - **Kumpul Paksa (`force_submit`):** Mengumpulkan paksa ujian siswa yang telah selesai atau melanggar.

---

### 3. 📊 Fase Pasca Ujian (Rekapitulasi Hasil Ujian untuk Guru di Next.js)
- **Halaman Rekapitulasi Hasil Ujian (`/dashboard/exams/[id]/recapitulation`):**
  - Menampilkan tabel rekapitulasi nilai seluruh peserta: NIS, Nama, Ruangan, Nomor Meja, Status Pengumpulan, Durasi Pengerjaan, Nilai Akhir, dan Log Pelanggaran.
  - Statistik ringkasan kelas: Jumlah Peserta, Nilai Rata-rata, Nilai Tertinggi, dan Nilai Terendah.
  - Fitur Ekspor Rekapitulasi ke format **CSV / Excel / PDF** langsung dari Next.js.
  - Mengambil data melalui Web Service Moodle `mod_cbt_get_recapitulation` dan otomatis terintegrasi ke Moodle Gradebook.

---

### 📁 Modul & Komponen Terkait di `aksaventra-cbt`
- `src/modules/exams/`: Services & UseCases untuk `ManageScheduleUseCase`, `ManageRosterUseCase`.
- `src/modules/proctor/`: Service & UseCases untuk `ProctorMonitorStreamUseCase` & `ExecuteProctorActionUseCase` (`lock`, `unlock`, `extend_time`, `force_submit`).
- `src/modules/recapitulation/`: UseCase untuk `GetExamRecapitulationUseCase`.
- `src/sections/proctor-room/`: Komponen `<LiveParticipantGrid />`, `<LiveAlertBanner />`, dan modal intervensi aksi proktor.
- `src/sections/recapitulation/`: Komponen tabel rekap nilai, kartu statistik, dan toolbar ekspor dokumen.
