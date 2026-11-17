"use client";

import { BookOpen, Edit3, FileText, HelpCircle } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type {
  SubjectDetailDTO,
  SubjectDTO,
} from "@/modules/subjects/domain/dto/SubjectDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SubjectCodeBadge from "../atoms/SubjectCodeBadge";

export interface ViewSubjectModalProps {
  open: boolean;
  subject: SubjectDTO | null;
  onClose: () => void;
  onLoadDetail: (id: string) => Promise<SubjectDetailDTO | null>;
  onEdit?: (subject: SubjectDTO) => void;
}

export const ViewSubjectModal: FC<ViewSubjectModalProps> = ({
  open,
  subject,
  onClose,
  onLoadDetail,
  onEdit,
}) => {
  const [detail, setDetail] = useState<SubjectDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (open && subject) {
      setLoading(true);
      void onLoadDetail(subject.id).then((res) => {
        if (!cancelled) {
          setDetail(res);
          setLoading(false);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, subject, onLoadDetail]);

  if (!subject) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detail Mata Pelajaran: ${subject.name}`}
      subtitle={
        subject.moodleCourseId
          ? `Moodle Course ID: #${subject.moodleCourseId}`
          : "Lokal Aksaventra CBT"
      }
      size="lg"
    >
      <div className="flex flex-col gap-5 py-1">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-1.5">
            <SubjectCodeBadge
              name={subject.name}
              shortName={subject.shortName}
            />
            <p className="text-xs text-slate-600">
              {subject.description || "Tidak ada deskripsi tambahan."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="teal" size="sm">
              <HelpCircle className="w-3.5 h-3.5 mr-1 inline" />
              {subject.questionCount} Soal
            </Badge>
            <Badge color="primary" size="sm">
              <FileText className="w-3.5 h-3.5 mr-1 inline" />
              {subject.examCount} Ujian
            </Badge>
          </div>
        </div>

        {/* Grade Level Grouping Summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#0097a7]" />
            Kelompok Tingkat Kelas:
          </span>
          {subject.gradeLevels.length > 0 ? (
            subject.gradeLevels.map((g) => (
              <Badge key={g} color="neutral" size="sm">
                Kelas {g}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400 italic">Belum ada butir soal</span>
          )}
        </div>

        {/* Linked Questions & Exams Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              Daftar Butir Soal (
              {detail?.questions.length ?? subject.questionCount})
            </div>
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Memuat...
              </div>
            ) : !detail || detail.questions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Belum ada soal terkait.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {detail.questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between px-4 py-2 text-xs"
                  >
                    <span className="font-mono font-bold text-slate-800">
                      {q.code}
                    </span>
                    <span className="text-slate-500">
                      Kelas {q.gradeLevel} • {q.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              Daftar Ujian CBT ({detail?.exams.length ?? subject.examCount})
            </div>
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Memuat...
              </div>
            ) : !detail || detail.exams.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Belum ada jadwal ujian terkait.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {detail.exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between px-4 py-2 text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate pr-2">
                      {ex.title}
                    </span>
                    <span className="text-slate-500 shrink-0">
                      {Math.round(ex.durationSeconds / 60)}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                onEdit(subject);
              }}
            >
              Edit Mapel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewSubjectModal;
