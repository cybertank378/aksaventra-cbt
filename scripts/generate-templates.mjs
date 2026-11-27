import fs from "node:fs";
import path from "node:path";
import writeXlsxFile from "write-excel-file/node";

function objectsToSheetData(records) {
  if (!records || records.length === 0) {
    return [];
  }
  const headers = Object.keys(records[0]);
  return [
    headers.map((h) => ({ value: h, fontWeight: "bold" })),
    ...records.map((row) => headers.map((h) => row[h] ?? "")),
  ];
}

// ==========================================
// 1. PANDUAN LENGKAP & PETUNJUK FORMAT SOAL
// ==========================================
const panduanData = [
  {
    KOLOM: "nomor",
    WAJIB: "Ya",
    "TIPE DATA": "Angka (1, 2, 3...)",
    KETERANGAN: "Nomor urut butir pertanyaan.",
  },
  {
    KOLOM: "jenis_soal",
    WAJIB: "Ya",
    "TIPE DATA": "Teks Kode Jenis",
    KETERANGAN:
      "Kode tipe soal wajib sesuai daftar berikut: multichoice_single, multichoice_multi, truefalse, shortanswer, numerical, match, gapselect, essay.",
  },
  {
    KOLOM: "teks_soal",
    WAJIB: "Ya",
    "TIPE DATA": "Teks / HTML / LaTeX",
    KETERANGAN:
      "Kalimat pertanyaan utama. Mendukung notasi matematika LaTeX seperti $E=mc^2$.",
  },
  {
    KOLOM: "bobot",
    WAJIB: "Ya",
    "TIPE DATA": "Angka Desimal (1.00, 2.50)",
    KETERANGAN:
      "Poin atau bobot nilai maksimal untuk soal ini (misal 1.00 atau 5.00).",
  },
  {
    KOLOM: "opsi_a s/d opsi_e",
    WAJIB: "Tergantung Tipe",
    "TIPE DATA": "Teks",
    KETERANGAN:
      "Pilihan jawaban untuk Pilihan Ganda & MCMA. Untuk Menjodohkan berisi daftar premis (1:Premis1; 2:Premis2). Untuk Teks Rumpang berisi pilihan kata (termasuk pengecoh).",
  },
  {
    KOLOM: "kunci_jawaban",
    WAJIB: "Ya",
    "TIPE DATA": "Teks / Kode",
    KETERANGAN:
      "Kunci jawaban valid sesuai tipe soal (lihat panduan spesifik tipe di bawah).",
  },
  {
    KOLOM: "toleransi_error",
    WAJIB: "Numerik Saja",
    "TIPE DATA": "Angka (0, 0.01, 0.05)",
    KETERANGAN:
      "Khusus tipe 'numerical', batas toleransi galat nilai hitungan yang dianggap benar. Isi 0 jika tidak ada toleransi.",
  },
  {
    KOLOM: "penjelasan_soal",
    WAJIB: "Opsional",
    "TIPE DATA": "Teks",
    KETERANGAN:
      "Umpan balik atau pembahasan soal yang tampil saat pembahasan / evaluasi.",
  },
];

const panduanTipeData = [
  {
    "TIPE SOAL": "1. Pilihan Ganda Tunggal",
    "KODE jenis_soal": "multichoice_single",
    "PENGISIAN OPSI": "Isi opsi_a sampai opsi_e (minimal A sampai C)",
    "FORMAT KUNCI JAWABAN": "Satu huruf kapital: A, B, C, D, atau E",
    "CONTOH KUNCI": "C",
    TOLERANSI: "0",
    "CATATAN KHUSUS": "Hanya satu opsi yang bernilai benar 100%.",
  },
  {
    "TIPE SOAL": "2. Pilihan Ganda Kompleks (MCMA)",
    "KODE jenis_soal": "multichoice_multi",
    "PENGISIAN OPSI": "Isi opsi_a sampai opsi_e",
    "FORMAT KUNCI JAWABAN": "Huruf-huruf jawaban benar dipisah koma",
    "CONTOH KUNCI": "A,C,E",
    TOLERANSI: "0",
    "CATATAN KHUSUS": "Siswa dapat mencentang lebih dari satu pilihan jawaban.",
  },
  {
    "TIPE SOAL": "3. Benar / Salah (True/False)",
    "KODE jenis_soal": "truefalse",
    "PENGISIAN OPSI":
      "opsi_a diisi 'Benar', opsi_b diisi 'Salah'. Opsi C-E dikosongkan.",
    "FORMAT KUNCI JAWABAN": "TRUE atau FALSE (atau Benar / Salah)",
    "CONTOH KUNCI": "TRUE",
    TOLERANSI: "0",
    "CATATAN KHUSUS": "Pernyataan yang dinilai kebenarannya.",
  },
  {
    "TIPE SOAL": "4. Isian Singkat (Short Answer)",
    "KODE jenis_soal": "shortanswer",
    "PENGISIAN OPSI": "Kosongkan opsi_a sampai opsi_e",
    "FORMAT KUNCI JAWABAN": "Kata atau frasa jawaban singkat yang tepat",
    "CONTOH KUNCI": "Linux",
    TOLERANSI: "0",
    "CATATAN KHUSUS":
      "Bisa memasukkan variasi jawaban jika diizinkan (misal: Linux; GNU/Linux).",
  },
  {
    "TIPE SOAL": "5. Pertanyaan Numerik (Hitungan)",
    "KODE jenis_soal": "numerical",
    "PENGISIAN OPSI": "Kosongkan opsi_a sampai opsi_e",
    "FORMAT KUNCI JAWABAN": "Angka jawaban pasti (gunakan titik untuk desimal)",
    "CONTOH KUNCI": "115 atau 3.14",
    TOLERANSI: "0.01",
    "CATATAN KHUSUS":
      "Jika toleransi diisi 0.01, maka jawaban 114.99 s/d 115.01 tetap dianggap benar.",
  },
  {
    "TIPE SOAL": "6. Menjodohkan (Matching)",
    "KODE jenis_soal": "match",
    "PENGISIAN OPSI":
      "opsi_a s/d opsi_d diisi daftar premis kiri format '1:Premis1', '2:Premis2'...",
    "FORMAT KUNCI JAWABAN":
      "Pasangan jawaban terhubung dengan ID premis: 1:Pasangan1;2:Pasangan2;...",
    "CONTOH KUNCI": "1:Tokyo;2:Paris;3:London;4:Roma",
    TOLERANSI: "0",
    "CATATAN KHUSUS":
      "Siswa mencocokkan setiap premis kiri dengan daftar pasangan kanan.",
  },
  {
    "TIPE SOAL": "7. Teks Rumpang (Cloze Gap Select)",
    "KODE jenis_soal": "gapselect",
    "PENGISIAN OPSI":
      "opsi_a s/d opsi_e diisi kata-kata pilihan (termasuk kata pengecoh)",
    "FORMAT KUNCI JAWABAN":
      "Nomor rumpang dipasangkan kata: 1:KataPertama;2:KataKedua",
    "CONTOH KUNCI": "1:Hypertext;2:Language",
    TOLERANSI: "0",
    "CATATAN KHUSUS":
      "Pada teks_soal wajib mencantumkan penanda rumpang ganda seperti [[1]] dan [[2]].",
  },
  {
    "TIPE SOAL": "8. Esai / Uraian Manual",
    "KODE jenis_soal": "essay",
    "PENGISIAN OPSI": "Kosongkan opsi_a sampai opsi_e",
    "FORMAT KUNCI JAWABAN": "requires_manual_grading (atau rubrik jawaban)",
    "CONTOH KUNCI": "requires_manual_grading",
    TOLERANSI: "0",
    "CATATAN KHUSUS":
      "Jawaban siswa dinilai manual oleh Guru / Korektor melalui antarmuka koreksi CBT.",
  },
];

// ==========================================
// 2. TEMPLATE UTAMA SEMUA TIPE SOAL (8 BUTIR CONTOH NYATA)
// ==========================================
const soalDataSemua = [
  {
    nomor: 1,
    jenis_soal: "multichoice_single",
    teks_soal:
      "Ibukota negara Indonesia yang baru diresmikan di Provinsi Kalimantan Timur adalah...",
    bobot: 1.0,
    opsi_a: "Jakarta",
    opsi_b: "Surabaya",
    opsi_c: "Nusantara",
    opsi_d: "Bandung",
    opsi_e: "Medan",
    kunci_jawaban: "C",
    toleransi_error: 0,
    penjelasan_soal:
      "Berdasarkan Undang-Undang IKN, ibukota baru Indonesia bernama Nusantara.",
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
    penjelasan_soal:
      "PHP, Node.js, dan Python adalah lingkungan komputasi backend server. HTML dan CSS adalah frontend mark-up/styling.",
  },
  {
    nomor: 3,
    jenis_soal: "truefalse",
    teks_soal:
      "Protokol HTTPS menggunakan enkripsi SSL/TLS untuk mengamankan komunikasi data antara browser dan server.",
    bobot: 1.0,
    opsi_a: "Benar",
    opsi_b: "Salah",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "TRUE",
    toleransi_error: 0,
    penjelasan_soal:
      "Benar. Huruf S pada HTTPS merujuk pada Secure dengan standar sertifikat SSL/TLS.",
  },
  {
    nomor: 4,
    jenis_soal: "shortanswer",
    teks_soal:
      "Sebutkan nama kernel dan sistem operasi open-source berlogo maskot pinguin Tux!",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "Linux",
    toleransi_error: 0,
    penjelasan_soal:
      "Sistem operasi Linux diciptakan oleh Linus Torvalds dengan maskot pinguin bernama Tux.",
  },
  {
    nomor: 5,
    jenis_soal: "numerical",
    teks_soal:
      "Sebuah resistor memiliki tegangan 25 Volt dan dialiri arus 0.25 Ampere. Berapakah nilai hambatannya (R = V / I) dalam Ohm?",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "100",
    toleransi_error: 0.05,
    penjelasan_soal:
      "R = 25 / 0.25 = 100 Ohm. Dengan toleransi galat 0.05, nilai antara 99.95 sampai 100.05 diterima sebagai benar.",
  },
  {
    nomor: 6,
    jenis_soal: "match",
    teks_soal:
      "Pasangkan setiap negara berikut dengan ibukotanya masing-masing!",
    bobot: 2.0,
    opsi_a: "1:Jepang",
    opsi_b: "2:Perancis",
    opsi_c: "3:Inggris",
    opsi_d: "4:Italia",
    opsi_e: "",
    kunci_jawaban: "1:Tokyo;2:Paris;3:London;4:Roma",
    toleransi_error: 0,
    penjelasan_soal:
      "Jepang beribukota Tokyo, Perancis Paris, Inggris London, dan Italia Roma.",
  },
  {
    nomor: 7,
    jenis_soal: "gapselect",
    teks_soal:
      "Dalam teknologi web, HTML adalah singkatan dari [[1]] Markup [[2]].",
    bobot: 1.0,
    opsi_a: "Hypertext",
    opsi_b: "Language",
    opsi_c: "Programming",
    opsi_d: "Cascading",
    opsi_e: "Style",
    kunci_jawaban: "1:Hypertext;2:Language",
    toleransi_error: 0,
    penjelasan_soal: "HTML = HyperText Markup Language.",
  },
  {
    nomor: 8,
    jenis_soal: "essay",
    teks_soal:
      "Jelaskan perbedaan mendasar antara Local Area Network (LAN) dan Wide Area Network (WAN) beserta contoh penerapannya!",
    bobot: 5.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "requires_manual_grading",
    toleransi_error: 0,
    penjelasan_soal:
      "Rubrik: 2 poin untuk jangkauan geografis LAN vs WAN, 2 poin untuk kecepatan & media transmisi, 1 poin untuk contoh konkret.",
  },
];

// ==========================================
// 3. CONTOH MASING-MASING TIPE (DEDICATED SHEETS)
// ==========================================
const soalPilihanGanda = [
  {
    nomor: 1,
    jenis_soal: "multichoice_single",
    teks_soal: "Siapakah presiden pertama Republik Indonesia?",
    bobot: 1.0,
    opsi_a: "Moh. Hatta",
    opsi_b: "Ir. Soekarno",
    opsi_c: "Soeharto",
    opsi_d: "B.J. Habibie",
    opsi_e: "Abdurrahman Wahid",
    kunci_jawaban: "B",
    toleransi_error: 0,
    penjelasan_soal: "Presiden pertama Indonesia adalah Ir. Soekarno.",
  },
  {
    nomor: 2,
    jenis_soal: "multichoice_single",
    teks_soal: "Satuan internasional untuk besaran arus listrik adalah...",
    bobot: 1.0,
    opsi_a: "Volt",
    opsi_b: "Watt",
    opsi_c: "Ampere",
    opsi_d: "Ohm",
    opsi_e: "Joule",
    kunci_jawaban: "C",
    toleransi_error: 0,
    penjelasan_soal: "Arus listrik diukur dalam satuan Ampere (A).",
  },
];

const soalPGKompleks = [
  {
    nomor: 1,
    jenis_soal: "multichoice_multi",
    teks_soal:
      "Manakah dari protokol internet berikut yang bekerja pada Application Layer (Layer 7 OSI)? (Pilih semua yang benar)",
    bobot: 2.0,
    opsi_a: "HTTP",
    opsi_b: "TCP",
    opsi_c: "DNS",
    opsi_d: "IP",
    opsi_e: "SMTP",
    kunci_jawaban: "A,C,E",
    toleransi_error: 0,
    penjelasan_soal:
      "HTTP, DNS, dan SMTP berada pada layer aplikasi (Layer 7). TCP adalah Transport (Layer 4) dan IP adalah Network (Layer 3).",
  },
];

const soalBenarSalah = [
  {
    nomor: 1,
    jenis_soal: "truefalse",
    teks_soal:
      "Matahari terbit dari sebelah barat dan terbenam di sebelah timur.",
    bobot: 1.0,
    opsi_a: "Benar",
    opsi_b: "Salah",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "FALSE",
    toleransi_error: 0,
    penjelasan_soal:
      "Pernyataan salah. Bumi berotasi dari barat ke timur sehingga matahari tampak terbit dari timur.",
  },
];

const soalIsianSingkat = [
  {
    nomor: 1,
    jenis_soal: "shortanswer",
    teks_soal:
      "Apa nama organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh?",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "Jantung",
    toleransi_error: 0,
    penjelasan_soal: "Organ pemompa darah adalah jantung.",
  },
];

const soalNumerik = [
  {
    nomor: 1,
    jenis_soal: "numerical",
    teks_soal:
      "Berapakah nilai percepatan gravitasi bumi rata-rata di permukaan laut dalam satuan m/s^2?",
    bobot: 1.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "9.8",
    toleransi_error: 0.2,
    penjelasan_soal: "Nilai g = 9.8 m/s^2 (diterima antara 9.6 sampai 10.0).",
  },
];

const soalMenjodohkan = [
  {
    nomor: 1,
    jenis_soal: "match",
    teks_soal: "Pasangkan simbol rumus kimia berikut dengan nama senyawanya!",
    bobot: 2.0,
    opsi_a: "1:H2O",
    opsi_b: "2:NaCl",
    opsi_c: "3:CO2",
    opsi_d: "4:O2",
    opsi_e: "",
    kunci_jawaban: "1:Air;2:Garam Dapur;3:Karbon Dioksida;4:Oksigen",
    toleransi_error: 0,
    penjelasan_soal:
      "H2O = Air, NaCl = Garam Dapur, CO2 = Karbon Dioksida, O2 = Oksigen.",
  },
];

const soalTeksRumpang = [
  {
    nomor: 1,
    jenis_soal: "gapselect",
    teks_soal:
      "Tanaman menyerap [[1]] dan air dari tanah, lalu mengubahnya menjadi oksigen melalui proses [[2]].",
    bobot: 1.0,
    opsi_a: "Mineral",
    opsi_b: "Fotosintesis",
    opsi_c: "Respirasi",
    opsi_d: "Karbon",
    opsi_e: "Evaporasi",
    kunci_jawaban: "1:Mineral;2:Fotosintesis",
    toleransi_error: 0,
    penjelasan_soal:
      "Tanaman menyerap mineral dan air, lalu melakukan fotosintesis.",
  },
];

const soalEsai = [
  {
    nomor: 1,
    jenis_soal: "essay",
    teks_soal:
      "Jelaskan tahapan siklus air (hidrologi) mulai dari evaporasi hingga presipitasi!",
    bobot: 5.0,
    opsi_a: "",
    opsi_b: "",
    opsi_c: "",
    opsi_d: "",
    opsi_e: "",
    kunci_jawaban: "requires_manual_grading",
    toleransi_error: 0,
    penjelasan_soal:
      "Kriteria: Penjelasan evaporasi (1 poin), kondensasi (2 poin), presipitasi (2 poin).",
  },
];

// ==========================================
// 4. DATA SISWA & REKAP NILAI
// ==========================================
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

// ==========================================
// 5. BUILDS WORKBOOK DENGAN FORMAT & STYLING
// ==========================================
const targetDir = path.join(process.cwd(), "public", "templates");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. BUAT WORKBOOK MULTI-SHEET LENGKAP UNTUK SOAL
await writeXlsxFile([
  { sheet: "TEMPLATE_SOAL", data: objectsToSheetData(soalDataSemua) },
  { sheet: "PANDUAN_KOLOM", data: objectsToSheetData(panduanData) },
  { sheet: "PANDUAN_8_TIPE", data: objectsToSheetData(panduanTipeData) },
  { sheet: "1_PILIHAN_GANDA", data: objectsToSheetData(soalPilihanGanda) },
  { sheet: "2_PG_KOMPLEKS", data: objectsToSheetData(soalPGKompleks) },
  { sheet: "3_BENAR_SALAH", data: objectsToSheetData(soalBenarSalah) },
  { sheet: "4_ISIAN_SINGKAT", data: objectsToSheetData(soalIsianSingkat) },
  { sheet: "5_NUMERIK", data: objectsToSheetData(soalNumerik) },
  { sheet: "6_MENJODOHKAN", data: objectsToSheetData(soalMenjodohkan) },
  { sheet: "7_TEKS_RUMPANG", data: objectsToSheetData(soalTeksRumpang) },
  { sheet: "8_ESAI_URAIAN", data: objectsToSheetData(soalEsai) },
]).toFile(path.join(targetDir, "sample_import_soal.xlsx"));

// Simpan file .csv (UTF-8 BOM dengan pemisah ;)
const csvHeaders = [
  "nomor",
  "jenis_soal",
  "teks_soal",
  "bobot",
  "opsi_a",
  "opsi_b",
  "opsi_c",
  "opsi_d",
  "opsi_e",
  "kunci_jawaban",
  "toleransi_error",
  "penjelasan_soal",
];
const csvLines = [csvHeaders.join(";")];
for (const row of soalDataSemua) {
  const line = csvHeaders
    .map((h) => {
      const val = row[h] ?? "";
      const str = String(val);
      if (str.includes(";") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(";");
  csvLines.push(line);
}
fs.writeFileSync(
  path.join(targetDir, "sample_import_soal.csv"),
  `\uFEFF${csvLines.join("\r\n")}`,
  "utf8",
);

// 2. SISWA WORKBOOK
const panduanSiswa = [
  {
    KOLOM: "nis_username",
    WAJIB: "Ya",
    KETERANGAN: "Nomor Induk Siswa (NIS) sebagai username login CBT.",
  },
  {
    KOLOM: "nama_lengkap",
    WAJIB: "Ya",
    KETERANGAN: "Nama lengkap siswa sesuai absen.",
  },
  {
    KOLOM: "password",
    WAJIB: "Ya",
    KETERANGAN: "Kata sandi akun siswa (default: Siswa@2026).",
  },
  {
    KOLOM: "kelas",
    WAJIB: "Ya",
    KETERANGAN: "Nama kelas / rombel (misal: X-RPL-1).",
  },
  {
    KOLOM: "ruang_ujian",
    WAJIB: "Ya",
    KETERANGAN:
      "Ruangan tempat siswa melaksanakan ujian (misal: Lab Komputer 1).",
  },
  {
    KOLOM: "nomor_meja",
    WAJIB: "Ya",
    KETERANGAN: "Nomor meja/kursi peserta (misal: A-01).",
  },
  {
    KOLOM: "email",
    WAJIB: "Opsional",
    KETERANGAN: "Alamat email siswa (otomatis dibuat jika kosong).",
  },
];

await writeXlsxFile([
  { sheet: "TEMPLATE_SISWA", data: objectsToSheetData(siswaData) },
  { sheet: "PANDUAN_SISWA", data: objectsToSheetData(panduanSiswa) },
]).toFile(path.join(targetDir, "sample_import_siswa.xlsx"));

// 3. REKAP NILAI WORKBOOK
await writeXlsxFile(objectsToSheetData(rekapData), {
  sheet: "REKAP_NILAI",
}).toFile(path.join(targetDir, "sample_rekap_nilai.xlsx"));

console.log(
  "Successfully generated multi-sheet Excel (.xlsx) templates with complete 8-type guides!",
);
