# 📊 ISSUE-12: Implementasi Section `src/sections/proctor-room/` & Halaman `/dashboard/*`

- **ID Issue:** `ISSUE-12`
- **Fase:** `4 - Proctor Room & Dashboards`
- **Prioritas:** `P1 (High)`
- **Bergantung Pada:** `ISSUE-08`, `ISSUE-09`
- **File Target (Sesuai Struktur Project):**
  - `src/sections/proctor-room/atoms/ParticipantStatusBadge.tsx`
  - `src/sections/proctor-room/atoms/LiveTokenDisplay.tsx`
  - `src/sections/proctor-room/molecules/ProctorStatCards.tsx`
  - `src/sections/proctor-room/molecules/TokenProjectorCard.tsx`
  - `src/sections/proctor-room/molecules/ParticipantActionModal.tsx`
  - `src/sections/proctor-room/organisms/LiveParticipantGrid.tsx`
  - `src/sections/proctor-room/pages/ProctorRoomSection.tsx`
  - `src/app/(protected)/dashboard/components/AdminDashboard.tsx`
  - `src/app/(protected)/dashboard/components/ProctorDashboard.tsx`
  - `src/app/(protected)/dashboard/components/TeacherDashboard.tsx`
  - `src/app/(protected)/dashboard/proctor/[examId]/page.tsx`
  - `src/app/(protected)/dashboard/exams/page.tsx`
  - `src/app/(protected)/dashboard/results/[examId]/page.tsx`

## 1. Deskripsi Tugas
1. **`ProctorStatCards.tsx`:** Menampilkan ringkasan *real-time*: Total Peserta, Sedang Mengerjakan, Terkunci (Indikasi Curang), Offline (> 60 detik), dan Selesai.
2. **`TokenProjectorCard.tsx`:** Kartu tampilan Token 6-Digit berukuran besar untuk ditampilkan di proyektor ruang ujian, dilengkapi hitung mundur rotasi token dan tombol **Rotasi Token Sekarang**.
3. **`LiveParticipantGrid.tsx` & `ParticipantActionModal.tsx`:** Tabel matriks peserta dengan filter status instan dan tombol eksekusi cepat (**Unlock Strike**, **Reset Device**, **Tambah Waktu +5/+10/+15 Menit**, dan **Force Submit**).
