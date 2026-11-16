"use client";

import {
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  KeyRound,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import ExamStatusBadge, { type ExamStatusType } from "../atoms/ExamStatusBadge";

export interface ExamDetailViewModel {
  id: string;
  moodleCbtId?: number;
  title: string;
  course: string;
  durationMinutes: number;
  maxStrikes: number;
  activeToken?: string | null;
  totalQuestions: number;
  timeOpen?: string;
  timeClose?: string;
  status: ExamStatusType;
}

export interface ViewExamModalProps {
  open: boolean;
  exam: ExamDetailViewModel | null;
  onClose: () => void;
  onEdit?: (exam: ExamDetailViewModel) => void;
  onAssignGroups?: (examId: string) => void;
}

export const ViewExamModal: FC<ViewExamModalProps> = ({
  open,
  exam,
  onClose,
  onEdit,
  onAssignGroups,
}) => {
  if (!exam) return null;

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={exam.title}
      subtitle={`Mata Pelajaran: ${exam.course}`}
      size="lg"
    >
      <div className="flex flex-col gap-5 py-1">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <ExamStatusBadge status={exam.status} />
            <Badge color="neutral" size="sm">
              {exam.totalQuestions} Butir Soal
            </Badge>
            {exam.moodleCbtId ? (
              <Badge color="teal" size="sm" variant="soft">
                Moodle CBT #{exam.moodleCbtId}
              </Badge>
            ) : null}
          </div>
          {exam.activeToken && (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0d2b5c]">
              <KeyRound className="w-4 h-4 text-[#0097a7]" />
              <span>Token: {exam.activeToken}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mata Pelajaran</span>
            </div>
            <p className="font-bold text-slate-800">{exam.course}</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Durasi &amp; Toleransi Pelanggaran</span>
            </div>
            <p className="font-bold text-slate-800">
              {exam.durationMinutes} Menit • Maks {exam.maxStrikes} Strikes
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Waktu Mulai (Open)</span>
            </div>
            <p className="font-semibold text-slate-800">
              {formatDate(exam.timeOpen)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Waktu Berakhir (Close)</span>
            </div>
            <p className="font-semibold text-slate-800">
              {formatDate(exam.timeClose)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          {onAssignGroups ? (
            <Button
              type="button"
              variant="outline"
              color="teal"
              size="sm"
              leftIcon={Users}
              onClick={() => {
                onClose();
                onAssignGroups(exam.id);
              }}
            >
              Kelompokkan Kelas / Peserta
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="filled"
                color="primary"
                size="sm"
                leftIcon={Edit3}
                onClick={() => {
                  onClose();
                  onEdit(exam);
                }}
              >
                Edit Ujian
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewExamModal;
