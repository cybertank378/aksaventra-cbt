"use client";

import { useCallback, useState } from "react";
import {
  downloadCsvBlob,
  downloadExcelBlob,
  generateExcelCsv,
} from "@/libs/excelCsvUtils";
import type { ExamRecapitulationDTO } from "../domain/dto/RecapitulationDTO";

export function useRecapitulationApi(examId?: string) {
  const [data, setData] = useState<ExamRecapitulationDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecapitulation = useCallback(
    async (id?: string) => {
      const targetId = id || examId;
      if (!targetId) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${targetId}/recapitulation`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error?.message || "Gagal memuat rekapitulasi ujian");
        }
      } catch {
        setError("Gangguan jaringan saat memuat data rekapitulasi");
      } finally {
        setIsLoading(false);
      }
    },
    [examId],
  );

  const exportToCSV = useCallback(async () => {
    if (!data || data.records.length === 0) return;

    setIsExporting(true);
    const filename = `rekap_nilai_${data.examTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;

    try {
      // 1. Attempt official Moodle Web Service export
      const cbtId = 1; // Default CBT or mapped Moodle ID
      const res = await fetch(
        `/api/moodle-proxy/mod_cbt_import_export?action=export_results&cbtid=${cbtId}`,
      );
      const moodleRes = await res.json();
      if (moodleRes.success && moodleRes.csv_data) {
        downloadCsvBlob(moodleRes.csv_data, filename);
        setIsExporting(false);
        return;
      }
    } catch {
      // Fallback to local data formatting
    }

    // 2. High-fidelity UTF-8 BOM semicolon delimited export
    const headers = [
      "nomor_meja",
      "ruang_ujian",
      "nis_username",
      "nama_lengkap",
      "status_ujian",
      "waktu_mulai",
      "waktu_selesai",
      "durasi_menit",
      "jumlah_pelanggaran",
      "nilai_akhir",
      "nilai_maksimal",
      "status_kelulusan",
    ];

    const rows = data.records.map((r) => {
      let kelulusan = r.isPassed ? "Lulus" : "Belum Lulus";
      if (r.status === "LOCKED") {
        kelulusan = "Diskualifikasi / Terkunci";
      }

      return [
        r.seatNumber || "-",
        r.roomCode || "-",
        r.username,
        r.fullName,
        r.status.toLowerCase(),
        r.startedAt ? new Date(r.startedAt).toLocaleString("id-ID") : "-",
        r.submittedAt ? new Date(r.submittedAt).toLocaleString("id-ID") : "-",
        r.durationSpentMinutes,
        r.violationCount,
        r.finalScore !== null ? Number(r.finalScore).toFixed(2) : "0.00",
        Number(data.maxScore ?? 100).toFixed(2),
        kelulusan,
      ];
    });

    const csvContent = generateExcelCsv(headers, rows, ";");
    downloadCsvBlob(csvContent, filename);
    setIsExporting(false);
  }, [data]);

  const exportToExcel = useCallback(
    (format: "xlsx" | "xls" = "xlsx") => {
      if (!data || data.records.length === 0) return;

      setIsExporting(true);
      try {
        const filename = `rekap_nilai_${data.examTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
        const headers = [
          "No",
          "Nomor Meja",
          "Ruang Ujian",
          "NIS / Username",
          "Nama Siswa",
          "Kelas",
          "Status Ujian",
          "Waktu Mulai",
          "Waktu Selesai",
          "Durasi (Menit)",
          "Pelanggaran",
          "Nilai Akhir",
          "Nilai Maksimal",
          "Status KKM",
        ];

        const rows = data.records.map((r, index) => {
          let kelulusan = r.isPassed ? "Tuntas" : "Remedial";
          if (r.status === "LOCKED") {
            kelulusan = "Diskualifikasi / Terkunci";
          }

          return [
            index + 1,
            r.seatNumber || "-",
            r.roomCode || "-",
            r.username,
            r.fullName,
            r.className || "-",
            r.status,
            r.startedAt ? new Date(r.startedAt).toLocaleString("id-ID") : "-",
            r.submittedAt
              ? new Date(r.submittedAt).toLocaleString("id-ID")
              : "-",
            r.durationSpentMinutes,
            r.violationCount,
            r.finalScore !== null ? Number(r.finalScore.toFixed(2)) : 0,
            Number((data.maxScore ?? 100).toFixed(2)),
            kelulusan,
          ];
        });

        downloadExcelBlob(headers, rows, filename, "Rekap Nilai", format);
      } finally {
        setIsExporting(false);
      }
    },
    [data],
  );

  return {
    data,
    isLoading,
    isExporting,
    error,
    fetchRecapitulation,
    exportToCSV,
    exportToExcel,
  };
}
