# [Feature] Integrasi Autentikasi Moodle (/login/token.php), Profil Sesi (core_webservice_get_site_info), dan Single Sign-On (SSO) Handshake Launch Bridge

## 📌 Deskripsi Kebutuhan Fungsional

Issue ini mengatur implementasi antarmuka dan logika backend Next.js (`aksaventra-cbt`) untuk mengintegrasikan proses login dan autentikasi pengguna (siswa, guru, dan admin) secara langsung dengan sistem akun **Moodle (`mod_cbt`)**, termasuk penanganan **Single Sign-On (SSO) Handshake** saat siswa membuka ujian dari antarmuka Moodle.

---

## 🎯 Lingkup Pekerjaan (Scope of Work)

### 1. 🔑 Autentikasi Pengguna via Moodle Token Endpoint (`/login/token.php`)
- **Adaptasi `src/modules/auth/` & Endpoint `/api/auth/login`:**
  - Menerima NIS/Username dan Password dari form login Next.js (`/login` atau `/student/login`).
  - Meneruskan verifikasi kredensial ke Moodle endpoint:
    ```http
    POST ${NEXT_PUBLIC_MOODLE_URL}/login/token.php
    Content-Type: application/x-www-form-urlencoded

    username={username}&password={password}&service=mod_cbt_service
    ```
  - Menangani respon error Moodle jika kredensial salah (`invalidlogin`) atau akun non-aktif dengan status HTTP `401 Unauthorized`.
  - Menerima `user_token` unik yang terikat pada identitas pengguna tersebut.

---

### 2. 👤 Pengambilan Profil & Role Pengguna (`core_webservice_get_site_info`)
- Menggunakan `user_token` hasil login untuk memanggil fungsi:
  ```http
  POST ${NEXT_PUBLIC_MOODLE_URL}/webservice/rest/server.php
  Content-Type: application/x-www-form-urlencoded

  wstoken={user_token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json
  ```
- Ekstraksi informasi pengguna:
  * `userid`: ID unik pengguna di Moodle.
  * `username`: NIS / Username.
  * `fullname`: Nama lengkap siswa / guru.
  * `userissiteadmin`: Menentukan apakah pengguna adalah Admin/Guru (`true`) atau Siswa (`false`).
- Membuat sesi terenkripsi Next.js (JWT Cookie / HttpOnly Session) yang memuat identitas dan token Moodle untuk pemanggilan API selanjutnya.

---

### 3. 🚀 Penanganan Single Sign-On (SSO) Handshake Launch Bridge (`/mod/cbt/launch.php`)
- **Halaman Target Handshake (`src/app/exam/page.tsx` atau middleware):**
  - Menangkap query parameter saat siswa dialihkan dari aktivitas Moodle:
    `?cbtid={cbtId}&cmid={cmId}&launch_token={launchToken}&moodle_api={moodleApi}`
  - Melakukan handshake validasi token ke Moodle Universal Cache (MUC).
  - Menginisialisasi sesi pengerjaan ujian secara otomatis tanpa meminta login ulang (*seamless zero-friction experience*).

---

### 4. 🔀 Role-Based Navigation & Redirection
- **Siswa (Candidate):**
  - Diarahkan langsung ke lobi konfirmasi ujian (`/student/lobby/[cbtId]`) dengan nomor meja dan ruang ujian yang telah ditetapkan.
- **Guru / Proktor / Admin:**
  - Diarahkan ke Dashboard Utama (`/dashboard`) untuk mengelola jadwal ujian, bank soal, penugasan kelas, dan memantau live proctoring.

---

## ✅ Kriteria Keberterimaan (Acceptance Criteria)

- [ ] Siswa dapat login ke aplikasi Next.js menggunakan NIS dan Password akun Moodle.
- [ ] Guru / Admin dapat login dan otomatis mendapatkan akses ke seluruh menu `/dashboard/*`.
- [ ] Siswa yang mengklik tombol launch dari Moodle langsung dialihkan dan masuk ke sesi ujian tanpa perlu login ulang.
- [ ] Token sesi disimpan dengan aman dalam cookie `HttpOnly` di sisi server Next.js.
- [ ] Pesan kesalahan ditampilkan dengan jelas jika username atau password salah.
