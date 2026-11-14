# 🎯 ISSUE-14: Penyelarasan Susunan Menu Sidebar dengan Desain Referensi CBT Online & Penyediaan Halaman Section yang Belum Lengkap

## 📌 Deskripsi Kebutuhan
Berdasarkan gambar desain referensi dashboard CBT Online, struktur navigasi antarmuka pengawas/guru/admin memerlukan penyesuaian susunan menu sidebar agar terbagi ke dalam **4 Kategori Menu** yang rapi dan terstruktur, serta melengkapi halaman-halaman section dan rute (`routes`) yang belum tersedia di Next.js 16 (`aksaventra-cbt`).

---

## 🗂️ 1. Restrukturisasi Menu Sidebar (`AppSidebar.tsx`)
Struktur menu sidebar wajib diselaraskan menjadi:

### A. Kategori: **UTAMA**
1. **Dashboard** (`/dashboard`)
   - Ikon: `LayoutDashboard` / `Gauge`
   - Role: `["ADMIN", "TEACHER", "PROCTOR"]`
2. **Monitoring Ujian** (`/dashboard/proctor`)
   - Ikon: `Radio` / `Activity` / `ShieldAlert`
   - Role: `["ADMIN", "TEACHER", "PROCTOR"]`
   - Badge: `"Live"`

### B. Kategori: **MANAJEMEN**
3. **Data Kelas** (`/dashboard/classes`)
   - Ikon: `Building2` / `School` / `GraduationCap`
   - Role: `["ADMIN", "TEACHER"]`
4. **Kelola Ujian** (`/dashboard/exams`)
   - Ikon: `FileText` / `ClipboardList`
   - Role: `["ADMIN", "TEACHER"]`
5. **Buat Soal** (`/dashboard/questions/new`)
   - Ikon: `PlusCircle` / `PenTool` / `LayoutGrid`
   - Role: `["ADMIN", "TEACHER"]`
6. **Bank Soal** (`/dashboard/questions`)
   - Ikon: `HelpCircle` / `BookOpen`
   - Role: `["ADMIN", "TEACHER"]`
7. **Data Siswa** (`/dashboard/students`)
   - Ikon: `Users`
   - Role: `["ADMIN", "TEACHER"]`
8. **Kartu Ujian** (`/dashboard/exam-cards`)
   - Ikon: `Contact` / `IdCard` / `CreditCard`
   - Role: `["ADMIN", "TEACHER"]`

### C. Kategori: **KOMUNIKASI**
9. **Pengumuman** (`/dashboard/announcements`)
   - Ikon: `Megaphone` / `Bell`
   - Role: `["ADMIN", "TEACHER", "PROCTOR"]`

### D. Kategori: **LAPORAN**
10. **Hasil Ujian** (`/dashboard/results`)
    - Ikon: `BarChart2` / `TrendingUp`
    - Role: `["ADMIN", "TEACHER"]`

### E. Bagian Bawah (**Bottom Profile & Action**)
- Tombol **Logout** dengan teks merah/aksen rose (`LogOut` icon) dan konfirmasi keluar.

---

## 🖥️ 2. Penyediaan Halaman Section Baru (Pages & Organisms)

Untuk memastikan setiap item menu di sidebar dapat diakses tanpa mengalami 404, perlu dibuat halaman-halaman section berikut dengan kaidah **Clean Architecture** (Page -> Organisms -> `use{Feature}Api`):

### 1. Index Monitoring Ujian (`/dashboard/proctor`)
- **Path**: `src/app/(protected)/dashboard/proctor/page.tsx`
- **Fitur**: Daftar ujian yang sedang berlangsung (Active / In Progress) hari ini dengan jumlah peserta online, status token, dan tombol akses cepat masuk ke ruang pemantauan spesifik (`/dashboard/proctor/[examId]`).

### 2. Bank Soal Terpusat (`/dashboard/questions`)
- **Path**: `src/app/(protected)/dashboard/questions/page.tsx`
- **Fitur**: Katalog bank butir soal berdasarkan mata pelajaran, tingkat kelas, dan 8 tipe pertanyaan CBT. Dilengkapi filter tipe soal dan tombol buat soal baru.

### 3. Buat Soal CBT (`/dashboard/questions/new`)
- **Path**: `src/app/(protected)/dashboard/questions/new/page.tsx`
- **Fitur**: Antarmuka pembuatan butir soal baru mencakup pemilihan tipe (Pilihan Ganda, MCMA, Benar/Salah, Isian, Numerik, Menjodohkan, Cloze, Esai), input stem LaTeX/KaTeX, opsi jawaban, dan bobot nilai.

### 4. Cetak Kartu Peserta Ujian (`/dashboard/exam-cards`)
- **Path**: `src/app/(protected)/dashboard/exam-cards/page.tsx`
- **Fitur**: Filter berdasarkan kelas/rombel dan jadwal ujian, preview tata letak kartu ujian (Foto/Inisial, Nama Siswa, NISN, Ruang Ujian, Nomor Meja, QR/Barcode verifikasi), dan tombol cetak siap print (A4 / Grid 8 kartu per lembar).

### 5. Pengumuman CBT (`/dashboard/announcements`)
- **Path**: `src/app/(protected)/dashboard/announcements/page.tsx`
- **Fitur**: Daftar pengumuman tata tertib ujian dan instruksi penting untuk siswa maupun pengawas dengan prioritas (Info, Peringatan, Penting).

### 6. Index Hasil Ujian (`/dashboard/results`)
- **Path**: `src/app/(protected)/dashboard/results/page.tsx`
- **Fitur**: Daftar seluruh jadwal ujian yang telah selesai (`COMPLETED`), jumlah peserta tuntas/remedial KKM, rata-rata skor, dan tombol langsung menuju detail rekapitulasi nilai (`/dashboard/exams/[id]/recapitulation` & `/dashboard/results/[id]`).

---

## 📐 3. Batasan Arsitektur & Kualitas Kode
1. **Aturan Atomic UI**:
   - `pages/` HANYA bertindak sebagai shell yang merender `organisms/`. Dilarang memanggil `fetch` atau hooks API secara langsung di layer `pages/`.
   - Organisms memanggil hook domain `use{Feature}Api.ts`.
2. **Next.js 16 Suspense Wrapping**:
   - Seluruh dynamic route dan komponen berstatus client wajib dibungkus `<Suspense>` agar Turbopack Partial Prerendering berjalan sukses.
3. **Identitas Visual Aksaventra**:
   - Deep Navy (`#0d2b5c`), Teal (`#0097a7`), Gold (`#eab308`), dan Slate (`#f1f5f9`).
4. **Validasi**:
   - Lolos `npx tsc --noEmit` (0 error).
   - Lolos `npx @biomejs/biome check`.
   - Lolos `npx vitest run`.
   - Lolos `npm run build` (29+ routes tanpa warning Turbopack root).

