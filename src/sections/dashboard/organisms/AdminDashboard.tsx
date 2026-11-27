"use client";

import {
  Activity,
  ArrowRight,
  Building2,
  Clock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface ActiveExamItem {
  id: string;
  title: string;
  courseName: string;
  activeParticipants: number;
  totalParticipants: number;
  startTime: string;
  status: "ACTIVE" | "SCHEDULED" | "ENDED";
}

export const AdminDashboard: FC = () => {
  const router = useRouter();
  const {
    examsList,
    fetchExamsList,
    isLoading: isExamsLoading,
  } = useExamManagementApi();
  const {
    classes,
    students,
    fetchClasses,
    fetchStudents,
    isLoading: isClassesLoading,
  } = useClassesApi();

  useEffect(() => {
    fetchExamsList();
    fetchClasses();
    fetchStudents();

    const handleSynced = () => {
      fetchExamsList();
      fetchClasses();
      fetchStudents();
    };
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchExamsList, fetchClasses, fetchStudents]);

  const studentCount = students.length;
  const classCount = classes.length;
  const isLoading = isExamsLoading || isClassesLoading;

  const activeExams: ActiveExamItem[] = examsList.map((e) => {
    const raw = e as unknown as { timeOpen?: string; status?: string };
    const rawStatus = raw.status?.toUpperCase();
    const status: "ACTIVE" | "SCHEDULED" | "ENDED" =
      rawStatus === "SCHEDULED" || rawStatus === "ENDED" ? rawStatus : "ACTIVE";

    return {
      id: String(e.examId || e.moodleCbtId),
      title: e.title || e.courseName || `Ujian #${e.examId}`,
      courseName: e.courseName || "-",
      activeParticipants: e.questions?.length || 0,
      totalParticipants: e.questions?.length || 0,
      startTime: raw.timeOpen
        ? new Date(raw.timeOpen).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      status,
    };
  });

  const activeSessionsCount = activeExams.filter(
    (e) => e.status === "ACTIVE",
  ).length;

  const handleNavigateToExams = () => {
    router.replace("/dashboard/exams");
  };

  const handleOpenProctor = (id: string) => {
    router.replace(`/dashboard/proctor/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d2b5c] to-[#163b78] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#0097a7] uppercase">
            Aksaventra CBT Command Center
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Dashboard Administrator Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            Pantau seluruh sesi ujian aktif, integritas koneksi server Moodle,
            dan kendali ruang pengawas secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="md"
            leftIcon={Plus}
            onClick={handleNavigateToExams}
          >
            Kelola Ujian
          </Button>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Sesi Ujian Aktif
            </span>
            <Activity className="w-4 h-4 text-[#0097a7]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
            {activeSessionsCount} Sesi
          </span>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            Live di Laboratorium
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Siswa Terdaftar
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {studentCount > 0 ? studentCount : "-"}
          </span>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Peserta Ujian CBT
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Rombel / Kelas
            </span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {classCount > 0 ? classCount : "-"}
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Kelas Tersinkron
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Naskah Ujian
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {examsList.length}
          </span>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Tersedia di Sistem
          </p>
        </Card>
      </div>

      {/* Active Exam Rooms Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sesi Ujian Berlangsung &amp; Terjadwal
            </h2>
            <p className="text-xs text-slate-500">
              Daftar sesi asesmen yang sedang diawasi di ruang ujian
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            rightIcon={ArrowRight}
            onClick={handleNavigateToExams}
          >
            Lihat Seluruh Ujian
          </Button>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-6 py-3.5">
                Nama Ujian &amp; Mata Pelajaran
              </TableHeaderCell>
              <TableHeaderCell className="px-6 py-3.5">Mulai</TableHeaderCell>
              <TableHeaderCell className="px-6 py-3.5">Status</TableHeaderCell>
              <TableHeaderCell className="px-6 py-3.5 text-right">
                Aksi
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && activeExams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-slate-400"
                >
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                  Memuat data asesmen langsung...
                </TableCell>
              </TableRow>
            ) : activeExams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-slate-400"
                >
                  Belum ada jadwal asesmen aktif saat ini.
                </TableCell>
              </TableRow>
            ) : (
              activeExams.slice(0, 5).map((exam) => (
                <TableRow
                  key={exam.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-xs">
                      {exam.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {exam.courseName}
                    </p>
                  </TableCell>

                  <TableCell className="px-6 py-4 font-mono font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <Badge
                      color={exam.status === "ACTIVE" ? "teal" : "neutral"}
                      size="sm"
                    >
                      {exam.status === "ACTIVE" ? "Live" : "Terjadwal"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      color="primary"
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => handleOpenProctor(exam.id)}
                    >
                      Monitoring
                    </Button>
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

export default AdminDashboard;
