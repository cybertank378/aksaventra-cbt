"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import type { FC } from "react";
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
import ExamStatusBadge, { type ExamStatusType } from "../atoms/ExamStatusBadge";

export interface ExamItemView {
  id: string;
  title: string;
  course: string;
  durationMinutes: number;
  totalQuestions: number;
  startDate: string;
  status: ExamStatusType;
}

interface ExamsTableProps {
  exams: ExamItemView[];
  totalMappedCount: number;
  isLoading: boolean;
  onCreateExam: () => void;
  onManageQuestions: (id: string) => void;
  onManageParticipants: (id: string) => void;
  onViewRecap: (id: string) => void;
  onOpenProctor: (id: string) => void;
}

export const ExamsTable: FC<ExamsTableProps> = ({
  exams,
  totalMappedCount,
  isLoading,
  onCreateExam,
  onManageQuestions,
  onManageParticipants,
  onViewRecap,
  onOpenProctor,
}) => {
  return (
    <Card className="p-0 overflow-hidden" bodyClassName="p-0">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="px-6 py-4">Nama Ujian</TableHeaderCell>
            <TableHeaderCell className="px-6 py-4">
              Jadwal &amp; Durasi
            </TableHeaderCell>
            <TableHeaderCell className="px-6 py-4">Jumlah Soal</TableHeaderCell>
            <TableHeaderCell className="px-6 py-4">Status</TableHeaderCell>
            <TableHeaderCell className="px-6 py-4 text-right">
              Aksi
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && totalMappedCount === 0 ? (
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
          ) : exams.length === 0 ? (
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
                    onClick={onCreateExam}
                  >
                    Buat Ujian Baru
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            exams.map((e) => (
              <TableRow
                key={e.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <TableCell className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-xs">{e.title}</p>
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
                  <ExamStatusBadge status={e.status} />
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
                      onClick={() => onManageQuestions(e.id)}
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
                      onClick={() => onManageParticipants(e.id)}
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
                      onClick={() => onViewRecap(e.id)}
                    >
                      Rekap
                    </Button>

                    <Button
                      type="button"
                      variant="filled"
                      color="primary"
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => onOpenProctor(e.id)}
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
  );
};

export default ExamsTable;
