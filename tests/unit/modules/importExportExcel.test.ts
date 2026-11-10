import { describe, expect, it } from "vitest";
import {
  detectDelimiter,
  generateExcelCsv,
  parseCsvText,
  stripBom,
} from "@/libs/excelCsvUtils";

describe("Excel & CSV Utilities for Moodle Import/Export", () => {
  it("should strip UTF-8 BOM if present", () => {
    const textWithBom = "\uFEFFnis_username;nama_lengkap";
    expect(stripBom(textWithBom)).toBe("nis_username;nama_lengkap");

    const plainText = "nis_username;nama_lengkap";
    expect(stripBom(plainText)).toBe("nis_username;nama_lengkap");
  });

  it("should detect semicolon vs comma delimiter accurately", () => {
    expect(detectDelimiter("nis_username;nama_lengkap;kelas")).toBe(";");
    expect(detectDelimiter("nis_username,nama_lengkap,kelas")).toBe(",");
  });

  it("should parse student CSV with semicolon delimiter", () => {
    const csvData = `\uFEFFnis_username;nama_lengkap;password;kelas;ruang_ujian;nomor_meja;email
1001;Ahmad Dahlan;Siswa@2026;X-RPL-1;Lab Komputer 1;A-01;ahmad@cbt.local
1002;Budi Santoso;Siswa@2026;X-RPL-1;Lab Komputer 1;A-02;budi@cbt.local`;

    const result = parseCsvText(csvData);
    expect(result.totalRows).toBe(2);
    expect(result.headers).toContain("nis_username");
    expect(result.headers).toContain("nama_lengkap");
    expect(result.rows[0].nis_username).toBe("1001");
    expect(result.rows[0].nama_lengkap).toBe("Ahmad Dahlan");
    expect(result.rows[1].nis_username).toBe("1002");
  });

  it("should parse question CSV with all 8 question types", () => {
    const questionCsv = `nomor;jenis_soal;teks_soal;bobot;kunci_jawaban
1;multichoice_single;Ibukota Indonesia;1.00;C
2;multichoice_multi;Bahasa backend;2.00;A,C,E
3;truefalse;HTTPS aman;1.00;TRUE
4;shortanswer;OS Pinguin;1.00;Linux
5;numerical;25 x 4;1.00;100
6;match;Pasangan ibukota;2.00;1:Tokyo
7;gapselect;HTML adalah [[1]];1.00;1:Hypertext
8;essay;Perbedaan LAN dan WAN;5.00;manual_grading`;

    const result = parseCsvText(questionCsv);
    expect(result.totalRows).toBe(8);
    const types = result.rows.map((r) => r.jenis_soal);
    expect(types).toEqual([
      "multichoice_single",
      "multichoice_multi",
      "truefalse",
      "shortanswer",
      "numerical",
      "match",
      "gapselect",
      "essay",
    ]);
  });

  it("should generate Excel-compatible CSV with UTF-8 BOM and semicolon", () => {
    const headers = ["nomor_meja", "nama_lengkap", "nilai_akhir"];
    const rows = [
      ["A-01", "Ahmad Dahlan", 88.5],
      ["A-02", "Budi Santoso", 76.0],
    ];

    const csvOutput = generateExcelCsv(headers, rows, ";");
    expect(csvOutput.startsWith("\uFEFF")).toBe(true);
    expect(csvOutput).toContain("nomor_meja;nama_lengkap;nilai_akhir");
    expect(csvOutput).toContain("A-01;Ahmad Dahlan;88.5");
  });

  it("should properly escape cells containing delimiters and quotes", () => {
    const headers = ["nama", "catatan"];
    const rows = [["Ahmad; Dahlan", 'Ujian "Sangat Baik"']];

    const csvOutput = generateExcelCsv(headers, rows, ";");
    expect(csvOutput).toContain('"Ahmad; Dahlan";"Ujian ""Sangat Baik"""');
  });
});
