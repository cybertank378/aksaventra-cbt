"use client";

import { useCallback, useState } from "react";
import type { ExamRecapitulationDTO } from "../domain/dto/RecapitulationDTO";

export function useRecapitulationApi(examId?: string) {
  const [data, setData] = useState<ExamRecapitulationDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const exportToCSV = useCallback(() => {
    if (!data || data.records.length === 0) return;

    const headers = [
      "No",
      "Nomor Meja",
      "Ruang",
      "NIS",
      "Nama Siswa",
      "Kelas",
      "Durasi (Menit)",
      "Status",
      "Pelanggaran",
      "Nilai Akhir",
      "Ketuntasan",
    ];

    const rows = data.records.map((r, i) => [
      i + 1,
      r.seatNumber,
      r.roomCode,
      r.username,
      `"${r.fullName}"`,
      `"${r.className}"`,
      r.durationSpentMinutes,
      r.status,
      r.violationCount,
      r.finalScore,
      r.isPassed ? "Tuntas" : "Remedial",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rekapitulasi_${data.examTitle.replace(/\s+/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    fetchRecapitulation,
    exportToCSV,
  };
}
