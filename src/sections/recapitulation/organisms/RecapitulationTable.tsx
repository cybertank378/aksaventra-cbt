"use client";

import { Download, Search } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { useRecapitulationApi } from "@/modules/recapitulation/presentation/useRecapitulationApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import ScoreBadge from "../atoms/ScoreBadge";
import RecapitulationStats from "../molecules/RecapitulationStats";

export interface RecapitulationTableProps {
  examId: string;
}

export const RecapitulationTable: FC<RecapitulationTableProps> = ({
  examId,
}) => {
  const {
    data,
    isLoading,
    isExporting,
    error,
    fetchRecapitulation,
    exportToCSV,
  } = useRecapitulationApi(examId);

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

  const handleProcessDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Overview Stats */}
      <RecapitulationStats data={data} />

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex-1 max-w-md">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NIS, atau nomor meja..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(["ALL", "PASSED", "FAILED"] as const).map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={statusFilter === s ? "filled" : "outline"}
                color={statusFilter === s ? "primary" : "secondary"}
                onClick={() => setStatusFilter(s)}
                className="rounded-xl"
              >
                {s === "ALL" ? "Semua" : s === "PASSED" ? "Tuntas" : "Remedial"}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_rekap_nilai.xlsx",
                "sample_rekap_nilai.xlsx"
              )
            }
            title="Unduh Template Format Excel (.xlsx)"
          >
            Template Excel (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_rekap_nilai.xls",
                "sample_rekap_nilai.xls"
              )
            }
            title="Unduh Template Format Excel (.xls)"
          >
            .xls
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Download}
            onClick={exportToCSV}
            disabled={isExporting}
          >
            {isExporting ? "Mengekspor..." : "Export Rekap Nilai (Excel)"}
          </Button>
        </div>
      </div>

      {/* Recapitulation Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-4 py-3.5">Meja</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5">Nama Siswa</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5">Kelas / Ruang</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5 text-center">Durasi</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5 text-center">Pelanggaran</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5 text-center">Nilai Akhir</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3.5 text-right">Status KKM</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Tidak ada peserta yang cocok dengan filter pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((rec) => (
                <TableRow
                  key={rec.attemptId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <Badge color="primary" variant="filled" size="sm" className="font-mono font-black text-xs">
                      {rec.seatNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{rec.fullName}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      NIS: {rec.username}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-slate-700">
                      {rec.className}
                    </p>
                    <p className="text-[11px] text-teal-600 font-bold">
                      {rec.roomCode}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-slate-600">
                    {rec.durationSpentMinutes} Menit
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-center">
                    {rec.violationCount > 0 ? (
                      <Badge color="error" size="sm">
                        {rec.violationCount}x
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-xs">0</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-center">
                    <ScoreBadge
                      score={rec.finalScore}
                      passingGrade={data.passingGrade}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Badge color={rec.isPassed ? "success" : "error"} size="sm">
                      {rec.isPassed ? "Tuntas" : "Remedial"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default RecapitulationTable;
