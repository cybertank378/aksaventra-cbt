"use client";

import { Calendar, Edit3, Hash, Home, ShieldCheck, User } from "lucide-react";
import type { FC } from "react";
import type { StudentDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import ClassBadge from "../atoms/ClassBadge";

export interface ViewStudentModalProps {
  open: boolean;
  student: StudentDTO | null;
  onClose: () => void;
  onEdit?: (student: StudentDTO) => void;
}

export const ViewStudentModal: FC<ViewStudentModalProps> = ({
  open,
  student,
  onClose,
  onEdit,
}) => {
  if (!student) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Peserta Didik (Siswa)"
      subtitle={`NIS / Username: ${student.username}`}
      size="md"
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="h-12 w-12 rounded-2xl bg-[#0d2b5c] text-white flex items-center justify-center font-black text-lg shrink-0">
            {student.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {student.fullName}
            </h3>
            <p className="text-xs font-mono text-slate-500">
              {student.username}
            </p>
          </div>
          <Badge color={student.isActive ? "success" : "error"} size="sm">
            {student.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Rombel / Kelas</span>
            </div>
            <div>
              {student.className ? (
                <ClassBadge name={student.className} size="sm" />
              ) : (
                <span className="text-slate-400 italic">Belum ditentukan</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Home className="w-3.5 h-3.5" />
              <span>Ruang Ujian Default</span>
            </div>
            <p className="font-bold text-slate-800">
              {student.roomCode || "Belum diatur"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Hash className="w-3.5 h-3.5" />
              <span>ID Akun CBT</span>
            </div>
            <p className="font-mono text-[11px] text-slate-700 truncate">
              {student.id}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Terdaftar Sejak</span>
            </div>
            <p className="font-semibold text-slate-700">
              {new Date(student.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Tersinkronisasi dengan Moodle LMS</span>
          </div>
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
                  onEdit(student);
                }}
              >
                Edit Siswa
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewStudentModal;
