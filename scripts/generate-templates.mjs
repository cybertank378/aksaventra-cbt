import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

// 1. Soal
const soalData = [
  {
    nomor: 1,
    jenis_soal: "multichoice_single",
    teks_soal: "Ibukota negara Indonesia yang baru diresmikan adalah...",
    bobot: 1.0,
    opsi_a: "Jakarta",
    opsi_b: "Surabaya",
    opsi_c: "Nusantara",
    opsi_d: "Bandung",
    opsi_e: "Medan",
    kunci_jawaban: "C",
    toleransi_error: 0,
  },
  {
    nomor: 2,
    jenis_soal: "multichoice_multi",
    teks_soal:
      "Manakah dari bahasa pemrograman berikut yang berjalan di sisi backend/server? (Pilih semua yang benar)",
    bobot: 2.0,
    opsi_a: "PHP",
    opsi_b: "HTML",
    opsi_c: "Node.js",
    opsi_d: "CSS",
    opsi_e: "Python",
    kunci_jawaban: "A,C,E",
    toleransi_error: 0,
  },
  {
    nomor: 3,
    jenis_soal: "truefalse",
    teks_soal:
      "Protokol HTTPS menggunakan enkripsi SSL/TLS untuk mengamankan pertukaran data.",
    bobot: 1.0,
    opsi_a: "Benar",
    opsi_b: "Salah",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "TRUE",
    toleransi_error: 0,
  },
  {
    nomor: 4,
    jenis_soal: "shortanswer",
    teks_soal: "Sebutkan nama sistem operasi open-source berlogo pinguin!",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "Linux",
    toleransi_error: 0,
  },
  {
    nomor: 5,
    jenis_soal: "numerical",
    teks_soal: "Berapakah hasil perhitungan dari 25 x 4 + 15?",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "115",
    toleransi_error: 0.01,
  },
  {
    nomor: 6,
    jenis_soal: "match",
    teks_soal: "Pasangkan negara berikut dengan ibukotanya masing-masing!",
    bobot: 2.0,
    opsi_a: "1:Jepang",
    opsi_b: "2:Perancis",
    opsi_c: "3:Inggris",
    opsi_d: "4:Italia",
    opsi_e: "",
    kunci_jawaban: "1:Tokyo;2:Paris;3:London;4:Roma",
    toleransi_error: 0,
  },
  {
    nomor: 7,
    jenis_soal: "gapselect",
    teks_soal: "HTML adalah singkatan dari [[1]] Markup [[2]].",
    bobot: 1.0,
    opsi_a: "Hypertext",
    opsi_b: "Language",
    opsi_c: "Programming",
    opsi_d: "Cascading",
    opsi_e: "Style",
    kunci_jawaban: "1:Hypertext;2:Language",
    toleransi_error: 0,
  },
  {
    nomor: 8,
    jenis_soal: "essay",
    teks_soal:
      "Jelaskan perbedaan mendasar antara Local Area Network (LAN) dan Wide Area Network (WAN)!",
    bobot: 5.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "requires_manual_grading",
    toleransi_error: 0,
  },
];

// 2. Siswa
const siswaData = [
  {
    nis_username: "1001",
    nama_lengkap: "Ahmad Dahlan",
    password: "Siswa@2026",
    kelas: "X-RPL-1",
    ruang_ujian: "Lab Komputer 1",
    nomor_meja: "A-01",
    email: "ahmad.dahlan@sekolah.sch.id",
  },
  {
    nis_username: "1002",
    nama_lengkap: "Budi Santoso",
    password: "Siswa@2026",
    kelas: "X-RPL-1",
    ruang_ujian: "Lab Komputer 1",
    nomor_meja: "A-02",
    email: "budi.santoso@sekolah.sch.id",
  },
  {
    nis_username: "1003",
    nama_lengkap: "Citra Lestari",
    password: "Siswa@2026",
    kelas: "X-RPL-1",
    ruang_ujian: "Lab Komputer 1",
    nomor_meja: "A-03",
    email: "citra.lestari@sekolah.sch.id",
  },
  {
    nis_username: "1004",
    nama_lengkap: "Dewi Sartika",
    password: "Siswa@2026",
    kelas: "X-TKJ-1",
    ruang_ujian: "Lab Komputer 2",
    nomor_meja: "B-01",
    email: "dewi.sartika@sekolah.sch.id",
  },
  {
    nis_username: "1005",
    nama_lengkap: "Eko Prasetyo",
    password: "Siswa@2026",
    kelas: "X-TKJ-1",
    ruang_ujian: "Lab Komputer 2",
    nomor_meja: "B-02",
    email: "eko.prasetyo@sekolah.sch.id",
  },
];

// 3. Rekap Nilai
const rekapData = [
  {
    nomor_meja: "A-01",
    ruang: "Lab Komputer 1",
    nis: "1001",
    nama_lengkap: "Ahmad Dahlan",
    kelas: "X-RPL-1",
    status: "submitted",
    waktu_mulai: "2026-11-06 08:00:00",
    waktu_selesai: "2026-11-06 08:45:12",
    durasi_menit: 45.2,
    pelanggaran_strike: 0,
    nilai_akhir: 88.5,
    nilai_maksimal: 100,
    status_kelulusan: "LULUS",
  },
  {
    nomor_meja: "A-02",
    ruang: "Lab Komputer 1",
    nis: "1002",
    nama_lengkap: "Budi Santoso",
    kelas: "X-RPL-1",
    status: "submitted",
    waktu_mulai: "2026-11-06 08:00:15",
    waktu_selesai: "2026-11-06 08:52:30",
    durasi_menit: 52.25,
    pelanggaran_strike: 1,
    nilai_akhir: 76.0,
    nilai_maksimal: 100,
    status_kelulusan: "LULUS",
  },
  {
    nomor_meja: "A-03",
    ruang: "Lab Komputer 1",
    nis: "1003",
    nama_lengkap: "Citra Lestari",
    kelas: "X-RPL-1",
    status: "submitted",
    waktu_mulai: "2026-11-06 08:00:05",
    waktu_selesai: "2026-11-06 08:40:10",
    durasi_menit: 40.1,
    pelanggaran_strike: 0,
    nilai_akhir: 94.0,
    nilai_maksimal: 100,
    status_kelulusan: "LULUS",
  },
  {
    nomor_meja: "B-01",
    ruang: "Lab Komputer 2",
    nis: "1004",
    nama_lengkap: "Dewi Sartika",
    kelas: "X-TKJ-1",
    status: "submitted",
    waktu_mulai: "2026-11-06 08:01:00",
    waktu_selesai: "2026-11-06 08:48:22",
    durasi_menit: 47.37,
    pelanggaran_strike: 0,
    nilai_akhir: 82.5,
    nilai_maksimal: 100,
    status_kelulusan: "LULUS",
  },
  {
    nomor_meja: "B-02",
    ruang: "Lab Komputer 2",
    nis: "1005",
    nama_lengkap: "Eko Prasetyo",
    kelas: "X-TKJ-1",
    status: "submitted",
    waktu_mulai: "2026-11-06 08:00:40",
    waktu_selesai: "2026-11-06 08:55:00",
    durasi_menit: 54.33,
    pelanggaran_strike: 2,
    nilai_akhir: 68.0,
    nilai_maksimal: 100,
    status_kelulusan: "REMIDI",
  },
];

const targetDir = path.join(process.cwd(), "public", "templates");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Generate Soal .xlsx and .xls
const wbSoal = XLSX.utils.book_new();
const wsSoal = XLSX.utils.json_to_sheet(soalData);
XLSX.utils.book_append_sheet(wbSoal, wsSoal, "Template Soal");
XLSX.writeFile(wbSoal, path.join(targetDir, "sample_import_soal.xlsx"));
XLSX.writeFile(wbSoal, path.join(targetDir, "sample_import_soal.xls"), {
  bookType: "biff8",
});

// Generate Siswa .xlsx and .xls
const wbSiswa = XLSX.utils.book_new();
const wsSiswa = XLSX.utils.json_to_sheet(siswaData);
XLSX.utils.book_append_sheet(wbSiswa, wsSiswa, "Template Siswa");
XLSX.writeFile(wbSiswa, path.join(targetDir, "sample_import_siswa.xlsx"));
XLSX.writeFile(wbSiswa, path.join(targetDir, "sample_import_siswa.xls"), {
  bookType: "biff8",
});

// Generate Rekap .xlsx and .xls
const wbRekap = XLSX.utils.book_new();
const wsRekap = XLSX.utils.json_to_sheet(rekapData);
XLSX.utils.book_append_sheet(wbRekap, wsRekap, "Rekap Nilai");
XLSX.writeFile(wbRekap, path.join(targetDir, "sample_rekap_nilai.xlsx"));
XLSX.writeFile(wbRekap, path.join(targetDir, "sample_rekap_nilai.xls"), {
  bookType: "biff8",
});

console.log("Successfully generated .xlsx and .xls template files!");
