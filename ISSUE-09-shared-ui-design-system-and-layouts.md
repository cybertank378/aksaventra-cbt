# 🎨 ISSUE-09: Implementasi Komponen Dasar `src/shared-ui/` & Identitas Visual Aksaventra

- **ID Issue:** `ISSUE-09`
- **Fase:** `3 - Shared UI & Atomic Sections`
- **Prioritas:** `P1 (High)`
- **Bergantung Pada:** `ISSUE-02`, `ISSUE-04`
- **File Target (Sesuai Struktur Project):**
  - `src/styles/globals.css`
  - `src/shared-ui/component/Badge.tsx`
  - `src/shared-ui/component/Button.tsx`
  - `src/shared-ui/component/Card.tsx`
  - `src/shared-ui/component/Input.tsx`
  - `src/shared-ui/component/Modal.tsx`
  - `src/shared-ui/component/Select.tsx`
  - `src/shared-ui/component/Skeleton.tsx`
  - `src/shared-ui/component/Table.tsx`
  - `src/shared-ui/component/Toast.tsx`
  - `src/shared-ui/layout/AppLayout.tsx`
  - `src/shared-ui/layout/AppSidebar.tsx`
  - `src/shared-ui/layout/AppTopbar.tsx`
  - `src/shared-ui/layout/ExamFocusLayout.tsx`

## 1. Deskripsi Tugas
Membangun sistem desain Aksaventra menggunakan Tailwind CSS v4 dengan palet warna resmi:
- **Deep Navy (`#0d2b5c`)**: Header ujian, Sidebar utama, dan tombol primer.
- **Teal (`#0097a7`)**: Indikator soal aktif, fokus input, dan aksen sekunder.
- **Gold (`#eab308`)**: Indikator soal **Ragu-ragu** dan peringatan *Blur Grace Period*.
- **Light Slate (`#f1f5f9`)**: Latar belakang kanvas pengerjaan soal agar mata siswa tidak cepat lelah.

## 2. Aturan Isolasi (`AGENTS.md`)
- Komponen di dalam `src/shared-ui/` harus bersifat *pure UI / presentational* dan dilarang mengimpor bisnis logika dari `src/modules/`.
