# ISSUE-15: Audit & Pembenahan UI, Copywriting, Responsivitas Mobile, Aksesibilitas, dan Kebersihan Komentar (Standar `antislop`)

## Ringkasan Masalah

Berdasarkan audit langsung terhadap kode frontend `aksaventra-cbt` menggunakan pedoman `GEMINI.md` (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-layoutmobile`, dan `antislop-code`), ditemukan sejumlah ketidaksesuaian pada copy antarmuka, kontrol yang tidak aktif (dead controls), tipografi yang tertimpa, target sentuh mobile di bawah 44px, interaksi keyboard pada modal/dropdown, serta komentar bergaya changelog/emoji di komponen produksi.

Issue ini menjadi acuan pembenahan terstruktur agar antarmuka Aksaventra CBT lebih bersih, mudah diakses, responsif di seluruh ukuran layar, dan konsisten dengan arsitektur Clean Architecture + Atomic Design.

---

## Konteks Arah Desain (`antislop-ui` / R-37)

- **Design Read:** Ruang kerja asesmen sekolah berbasis web (CBT) yang tenang, jelas, dan cepat dipindai oleh admin, guru, pengawas, serta siswa saat sesi ujian berlangsung.
- **Dials:** `ENERGY: low-medium` (fokus pada keterbacaan soal dan data ujian), `RHYTHM: structured` (hierarki jelas antara header, filter, konten utama, dan paginasi), `MOTION: restrained` (transisi singkat dan menghormati `prefers-reduced-motion`).
- **Dokumen Referensi:** Buat `DESIGN.md` di root repositori yang mendokumentasikan peran warna (`navy`, `teal`, `gold`, `slate`), skala tipografi (`Plus Jakarta Sans` + `JetBrains Mono`), aturan radius/elevasi, dan aturan state (`loading`, `empty`, `error`).

---

## Daftar Temuan & Ruang Lingkup Pekerjaan

### 1. Copywriting, Buzzword, & Penghapusan Em Dash (`antislop-copywriting`, R-02, R-09, R-16)
- [ ] **Hapus seluruh karakter em dash (`\u2014`) di teks UI** (gunakan tanda baca standar seperti koma, titik dua, tanda hubung `-`, atau tanda kurung):
  - `src/app/layout.tsx:13` (metadata description)
  - `src/shared-ui/layout/AppSidebar.tsx:284` (prefiks label kategori menu)
  - `src/sections/dashboard/organisms/AdminDashboard.tsx:152, 167` (nilai kosong metrik siswa & kelas, ganti dengan `"-"` atau `"0"`)
  - `src/sections/classes/molecules/ImportStudentsModal.tsx:207`
  - `src/sections/classes/organisms/ExamRoomSeatLayoutManager.tsx:762, 978`
  - `src/sections/proctor-room/molecules/ParticipantActionModal.tsx:117`
  - `src/sections/student-lobby/organisms/StudentLobbyIndexView.tsx:258, 285`
  - `src/libs/roomSeatPdfGenerator.ts:198`
- [ ] **Bersihkan kalimat buzzword dan badge dekoratif yang tidak menambah informasi operasional:**
  - `src/app/layout.tsx:13`: ubah deskripsi metadata menjadi deskripsi lugas sistem ujian berbasis komputer.
  - `src/sections/auth/pages/AuthSection.tsx:36-49`: hapus tagline `"Zero-Latency Exam Workspace"` serta dua badge dekoratif `"High-Performance Engine"` dan `"Moodle mod_cbt Integrated"` pada header halaman login; pertahankan identitas aplikasi yang ringkas.
  - `src/shared-ui/layout/AppTopbar.tsx:155`: ganti fallback subtitle `"High-Performance Zero-Latency Exam Workspace"` menjadi `"Sistem Ujian Berbasis Komputer"`.
- [ ] **Ganti emoji dekoratif di komponen UI dengan ikon `lucide-react`:**
  - `src/sections/auth/organisms/LoginForm.tsx:107`: ganti teks `"⚠️ Error:"` dengan ikon `AlertCircle` dari `lucide-react` beserta pesan kesalahan yang jelas.

### 2. Penghapusan Kontrol Mati & Elemen Demo di Produksi (R-26, R-38)
- [ ] **Tombol Notifikasi di Topbar (`src/shared-ui/layout/AppTopbar.tsx:310-319`):**
  - Saat ini tombol lonceng tidak memiliki handler `onClick` dan selalu menampilkan titik merah statis (`bg-rose-500`).
  - Hubungkan ke panel notifikasi/pengumuman aktif yang nyata, atau sembunyikan sampai fitur notifikasi tersedia agar tidak ada kontrol mati.
- [ ] **Input Pencarian Global di Topbar (`src/shared-ui/layout/AppTopbar.tsx:271-280`):**
  - Input tetap tampil meskipun prop `onSearch` tidak diberikan oleh halaman aktif, sehingga pengetikan tidak menghasilkan aksi apa pun.
  - Render input pencarian hanya ketika `onSearch` tersedia (atau sambungkan ke pencarian global yang berfungsi).
- [ ] **Switcher Peran Demo di Dashboard (`src/sections/dashboard/pages/DashboardSection.tsx:26-51`):**
  - Kartu `"Pratinjau Mode Peran (Role View)"` saat ini tampil untuk semua pengguna dan memungkinkan perpindahan tampilan peran secara lokal.
  - Gunakan peran sesi terautentikasi sebagai tampilan utama; jika pratinjau peran masih dibutuhkan untuk pengujian, batasi hanya pada mode pengembangan (`NODE_ENV === "development"`) atau khusus `ADMIN`.

### 3. Tipografi, Token CSS, & Preferensi Gerak (`antislop-ui`, R-40)
- [ ] **Aktifkan font brand pada `src/styles/globals.css:29-35`:**
  - `src/app/layout.tsx:31-39` sudah memuat `Plus_Jakarta_Sans` (`--font-sans`) dan `JetBrains_Mono` (`--font-mono`), tetapi `body` di `src/styles/globals.css` masih memakai `font-family: system-ui, ...` sehingga font utama tidak aktif.
  - Petakan `--font-sans` dan `--font-mono` ke `@theme inline` dan `body`.
- [ ] **Tambahkan dukungan `prefers-reduced-motion` di `src/styles/globals.css`:**
  - Nonaktifkan atau minimalisasi animasi/transisi ketika pengguna mengaktifkan preferensi pengurangan gerak di sistem operasi.
- [ ] **Tambahkan dokumen `DESIGN.md`** di root proyek sebagai rujukan token warna, tipografi, komponen, dan state antarmuka.

### 4. Aksesibilitas Keyboard, Kursor Interaktif, & Ergonomi Mobile (`antislop-layoutmobile`, R-03, R-25, R-27, R-39)
- [ ] **Target sentuh minimal 44x44px pada perangkat mobile (`< 768px`):**
  - `src/shared-ui/layout/AppTopbar.tsx:248-255`: perbesar tombol menu hamburger dari `h-9 w-9` (36px) menjadi minimal `h-11 w-11` (44px) di mobile.
  - `src/shared-ui/layout/AppSidebar.tsx:259-266`: perbesar tombol tutup sidebar mobile dari `h-8 w-8` (32px) menjadi minimal `h-11 w-11` (44px).
- [ ] **Tambahkan `cursor-pointer` dan `focus-visible` yang konsisten pada tombol interaktif non-`Button`:**
  - `src/shared-ui/layout/AppSidebar.tsx:245-267, 351-362` (tombol collapse, tombol tutup mobile, dan tombol logout).
  - `src/shared-ui/layout/AppTopbar.tsx:248-255, 311-319, 323-352` (tombol menu mobile, notifikasi, dan trigger dropdown profil).
- [ ] **Perbaiki interaksi keyboard pada Modal & Dropdown:**
  - `src/shared-ui/component/Modal.tsx:59-88`: pasang listener `keydown` `Escape` pada `document` saat `open === true`, kelola fokus awal saat modal terbuka, kembalikan fokus ke pemicu saat tertutup, dan sediakan tombol tutup (`aria-label="Tutup dialog"`) yang dapat diakses keyboard.
  - `src/shared-ui/layout/AppTopbar.tsx:323-355`: tambahkan atribut `aria-expanded={isOpen}`, `aria-haspopup="menu"`, serta penutupan dropdown dengan tombol `Escape`.
- [ ] **Verifikasi tata letak mobile (`375px` & `768px`):**
  - Pastikan tabel pada `src/sections/dashboard/organisms/AdminDashboard.tsx:214-220` dan halaman daftar lainnya memiliki pembungkus `overflow-x-auto` yang rapi tanpa menyebabkan scroll horizontal pada seluruh halaman.

### 5. Kebersihan Komentar Kode (`antislop-code`)
- [ ] **Hapus komentar bergaya changelog, emoji, dan komentar yang hanya mengulang struktur JSX:**
  - `src/shared-ui/component/Modal.tsx:92, 93, 99` (`// ✅ tambah ini`, `// ✅ lebih kuat`, `{/* ✅ HEADER (conditional) */}`)
  - `src/shared-ui/component/Chip.tsx:17, 37` (komentar emoji)
  - `src/sections/student-lobby/molecules/TokenVerificationCard.tsx:29` (komentar emoji)
  - `src/shared-ui/component/Form/FormLabel.tsx:8, 16` dan `src/shared-ui/component/UploadButton.tsx:6` (komentar emoji)
  - Rapikan komentar banner ALL-CAPS dekoratif pada `src/shared-ui/layout/AppSidebar.tsx` dan `src/shared-ui/layout/AppTopbar.tsx`. Pertahankan hanya komentar yang menjelaskan alasan bisnis, keamanan, atau batasan teknis non-trivial.

---

## Kriteria Penerimaan (Acceptance Criteria)

1. Pencarian karakter em dash pada seluruh berkas UI di `src/` menghasilkan nol temuan (kecuali tabel konversi entitas HTML di `src/libs/htmlEditorUtils.ts`).
2. Tidak ada lagi badge/copy buzzword di halaman login, metadata root, maupun fallback topbar.
3. Tidak ada kontrol mati pada `AppTopbar` dan tidak ada role switcher demo yang tampil bebas di produksi.
4. Font `Plus Jakarta Sans` dan `JetBrains Mono` aktif terpakai pada `body` dan elemen monospace, serta aturan `prefers-reduced-motion` terpasang di `src/styles/globals.css`.
5. Seluruh tombol navigasi mobile memiliki area sentuh minimal 44x44px, tombol interaktif memakai `cursor-pointer` + `focus-visible`, dan `Modal` serta dropdown `AppTopbar` dapat ditutup lewat tombol `Escape`.
6. Komentar emoji dan catatan changelog pada berkas yang disebut di atas telah dibersihkan.
7. `npx tsc --noEmit` dan `npm run lint` lolos tanpa error.
