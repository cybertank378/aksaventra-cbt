"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
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

interface ExamItemView {
  id: string;
  title: string;
  course: string;
  durationMinutes: number;
  totalQuestions: number;
  startDate: string;
  status: "ACTIVE" | "SCHEDULED" | "COMPLETED";
}

export interface ExamsManagementSectionProps {
  userRole?: UserRole;
}

export const ExamsManagementSection: FC<ExamsManagementSectionProps> = ({
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { examsList, fetchExamsList, isLoading, error } =
    useExamManagementApi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  // Map API ExamSnapshotDTO to UI ExamItemView
  const mappedExams: ExamItemView[] =
    examsList && examsList.length > 0
      ? examsList.map((e) => {
          const durationMins = Math.round((e.durationSeconds || 5400) / 60);
          const raw = e as unknown as {
            timeOpen?: string;
            timeClose?: string;
            status?: string;
          };
          const computedStatus: "ACTIVE" | "SCHEDULED" | "COMPLETED" =
            raw.status === "SCHEDULED" || raw.status === "COMPLETED"
              ? raw.status
              : raw.timeClose && new Date(raw.timeClose) < new Date()
                ? "COMPLETED"
                : raw.timeOpen && new Date(raw.timeOpen) > new Date()
                  ? "SCHEDULED"
                  : "ACTIVE";

          return {
            id: String(e.examId || e.moodleCbtId),
            title: e.title || e.courseName || `Ujian CBT #${e.examId}`,
            course: e.courseName || "-",
            durationMinutes: durationMins,
            totalQuestions: e.questions?.length || 0,
            startDate: raw.timeOpen
              ? new Date(raw.timeOpen).toLocaleDateString("id-ID")
              : "-",
            status: computedStatus,
          };
        })
      : [];

  const filteredExams = mappedExams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter !== "ALL" && e.status !== filter) {
      return false;
    }
    return true;
  });

  const handleCreateExam = () => {
    router.replace("/dashboard/exams/new");
  };

  const handleManageQuestions = (id: string) => {
    router.replace(`/dashboard/exams/${id}/questions`);
  };

  const handleManageParticipants = (id: string) => {
    router.replace(`/dashboard/exams/${id}/participants`);
  };

  const handleViewRecap = (id: string) => {
    router.replace(`/dashboard/exams/${id}/recapitulation`);
  };

  const handleOpenProctor = (id: string) => {
    router.replace(`/dashboard/proctor/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="w-full sm:w-96">
          <TextField
            placeholder="Cari naskah ujian atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => fetchExamsList()}
            disabled={isLoading}
          >
            {isLoading ? "Memuat..." : "Refresh"}
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleCreateExam}
          >
            Buat Ujian Baru
          </Button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            {["ALL", "ACTIVE", "SCHEDULED", "COMPLETED"].map((tab) => (
              <Button
                key={tab}
                type="button"
                size="sm"
                variant={filter === tab ? "filled" : "ghost"}
                color={filter === tab ? "primary" : "secondary"}
                onClick={() => setFilter(tab)}
                className="rounded-lg text-xs"
              >
                {tab === "ALL"
                  ? "Semua"
                  : tab === "ACTIVE"
                    ? "Sedang Aktif"
                    : tab === "SCHEDULED"
                      ? "Terjadwal"
                      : "Selesai"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Exams Table Container */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-6 py-4">Nama Ujian</TableHeaderCell>
              <TableHeaderCell className="px-6 py-4">Jadwal & Durasi</TableHeaderCell>
              <TableHeaderCell className="px-6 py-4">Jumlah Soal</TableHeaderCell>
              <TableHeaderCell className="px-6 py-4">Status</TableHeaderCell>
              <TableHeaderCell className="px-6 py-4 text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && mappedExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                    <p className="font-semibold text-xs">
                      Memuat data ujian dari Moodle CBT...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                  <p className="font-bold text-sm text-slate-700">
                    Tidak ada naskah ujian ditemukan
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan buat jadwal naskah ujian baru atau ubah kata kunci
                    pencarian.
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="filled"
                      color="primary"
                      size="sm"
                      leftIcon={Plus}
                      onClick={() => router.push("/dashboard/exams/new")}
                    >
                      Buat Ujian Baru
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((e) => (
                <TableRow
                  key={e.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-xs">
                      {e.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {e.course}
                    </p>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{e.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{e.durationMinutes} Menit</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 font-semibold text-slate-700">
                    {e.totalQuestions} Butir Soal
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <Badge
                      color={
                        e.status === "ACTIVE"
                          ? "teal"
                          : e.status === "SCHEDULED"
                            ? "neutral"
                            : "success"
                      }
                      size="sm"
                    >
                      {e.status === "ACTIVE"
                        ? "Aktif"
                        : e.status === "SCHEDULED"
                          ? "Terjadwal"
                          : "Selesai"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        color="secondary"
                        size="sm"
                        leftIcon={BookOpen}
                        title="Kelola Butir Soal"
                        onClick={() => handleManageQuestions(e.id)}
                      >
                        Soal
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        color="secondary"
                        size="sm"
                        leftIcon={Users}
                        title="Distribusi Meja & Peserta"
                        onClick={() => handleManageParticipants(e.id)}
                      >
                        Meja
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        color="secondary"
                        size="sm"
                        leftIcon={BarChart3}
                        title="Rekapitulasi Nilai"
                        onClick={() => handleViewRecap(e.id)}
                      >
                        Rekap
                      </Button>

                      <Button
                        type="button"
                        variant="filled"
                        color="primary"
                        size="sm"
                        rightIcon={ArrowRight}
                        onClick={() => handleOpenProctor(e.id)}
                      >
                        Proktor
                      </Button>
                    </div>
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

export default ExamsManagementSection;
