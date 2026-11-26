# Aksaventra CBT Design Direction (`DESIGN.md`)

## Design Read
Ruang kerja asesmen sekolah berbasis web (Computer-Based Testing) yang tenang, jelas, dan cepat dipindai oleh admin, guru, pengawas, serta siswa selama persiapan maupun pelaksanaan ujian. Prioritas utama antarmuka adalah keterbacaan naskah soal (termasuk rumus matematika dan gambar), kejelasan status sesi ujian, dan keandalan kontrol tanpa dekorasi yang mengalihkan perhatian.

## Dials (`antislop-ui`)
- **ENERGY:** `low-medium` (fokus pada keterbacaan soal, tabel peserta, dan indikator status ujian).
- **RHYTHM:** `structured` (pembagian tegas antara navigasi samping, bar atas, filter/aksi, konten utama, dan paginasi).
- **MOTION:** `restrained` (transisi singkat `150ms-200ms`, tanpa animasi berulang yang mengganggu, mematuhi `prefers-reduced-motion`).

## Palet Warna & Peran
| Token | Nilai | Peran |
| --- | --- | --- |
| `--background` | `#f1f5f9` | Kanvas utama aplikasi (Slate 100) |
| `--foreground` | `#0d2b5c` | Teks judul utama dan identitas merek (Navy) |
| `--color-aksaventra-navy` | `#0d2b5c` | Aksi primer, header penting, fokus merek |
| `--color-aksaventra-teal` | `#0097a7` | Aksi sekunder, fokus input (`focus-visible`), aksen sinkronisasi |
| `--color-aksaventra-gold` | `#eab308` | Indikator perhatian, status Live, peran Pengawas |
| Semantic Rose / Emerald | Tailwind `rose-600`, `emerald-600` | Status kesalahan/pelanggaran dan status berhasil/aktif |

## Tipografi
- **UI & Teks Soal:** `Plus Jakarta Sans` (`var(--font-sans)`) dengan fallback sans-serif sistem.
- **Kode, Token, NISN, Angka Timer:** `JetBrains Mono` (`var(--font-mono)`) dengan fallback monospace sistem.
- **Keterbacaan Soal:** Rumus menggunakan KaTeX (`.math-renderer`), gambar soal proporsional (`max-width: 100%; height: auto`) dan tidak terpotong oleh `line-clamp`.

## Interaksi, Aksesibilitas, & Mobile
- Seluruh kontrol interaktif (`button`, tautan aksi, trigger dropdown) menggunakan `cursor-pointer` dan indikator fokus keyboard `focus-visible`.
- Tombol navigasi pada layar mobile (`< 768px`) memiliki area sentuh minimal `44x44px` (`h-11 w-11`).
- Dialog (`Modal`) dan menu dropdown mendukung penutupan lewat tombol `Escape`, atribut ARIA (`aria-modal`, `aria-expanded`, `aria-haspopup`), dan tidak menyisakan kontrol mati tanpa handler.
- Setiap daftar data menampilkan state eksplisit untuk kondisi `loading`, `empty`, dan `error` dengan pesan penyebab serta langkah lanjutan yang jelas.
- Copy antarmuka memakai Bahasa Indonesia yang lugas, tanpa buzzword pemasaran dan tanpa karakter em dash.
