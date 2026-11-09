"use client";

import { Download, Search } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { useRecapitulationApi } from "@/modules/recapitulation/presentation/useRecapitulationApi";
import Button from "@/shared-ui/component/Button";
import ScoreBadge from "../atoms/ScoreBadge";
import RecapitulationStats from "../molecules/RecapitulationStats";

export interface RecapitulationTableProps {
  examId: string;
}

export const RecapitulationTable: FC<RecapitulationTableProps> = ({
  examId,
}) => {
  const { data, isLoading, error, fetchRecapitulation, exportToCSV } =
    useRecapitulationApi(examId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchRecapitulation(examId);
  }, [fetchRecapitulation, examId]);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    return data.records.filter((r) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = r.fullName.toLowerCase().includes(q);
        const matchNIS = r.username.toLowerCase().includes(q);
        const matchSeat = r.seatNumber.toLowerCase().includes(q);
        if (!matchName && !matchNIS && !matchSeat) return false;
      }
      if (statusFilter === "PASSED") return r.isPassed;
      if (statusFilter === "FAILED") return !r.isPassed;
      return true;
    });
  }, [data, search, statusFilter]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-slate-500">
        <p className="font-semibold text-rose-600 mb-2">
          {error || "Data rekapitulasi tidak tersedia."}
        </p>
        <Button
          type="button"
          variant="outline"
          color="primary"
          size="sm"
          onClick={() => fetchRecapitulation(examId)}
        >
          Coba Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Overview Stats */}
      <RecapitulationStats data={data} />

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NIS, atau nomor meja..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(["ALL", "PASSED", "FAILED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s
                    ? "bg-[#0d2b5c] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {s === "ALL" ? "Semua" : s === "PASSED" ? "Tuntas" : "Remedial"}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Download}
            onClick={exportToCSV}
          >
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Recapitulation Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5">Meja</th>
                <th className="px-4 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">Kelas / Ruang</th>
                <th className="px-4 py-3.5 text-center">Durasi</th>
                <th className="px-4 py-3.5 text-center">Pelanggaran</th>
                <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-4 py-3.5 text-right">Status KKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Tidak ada peserta yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.attemptId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#0d2b5c] text-white">
                        {rec.seatNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{rec.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        NIS: {rec.username}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-700">
                        {rec.className}
                      </p>
                      <p className="text-[11px] text-teal-600 font-bold">
                        {rec.roomCode}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-slate-600">
                      {rec.durationSpentMinutes} Menit
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {rec.violationCount > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                          {rec.violationCount}x
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <ScoreBadge
                        score={rec.finalScore}
                        passingGrade={data.passingGrade}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {rec.isPassed ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Tuntas
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          Remedial
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecapitulationTable;
