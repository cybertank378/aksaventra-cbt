"use client";

import { Calendar, Megaphone, User } from "lucide-react";
import type { FC } from "react";
import type { AnnouncementItemDTO } from "@/modules/announcements/domain/dto/AnnouncementDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import PriorityBadge from "../atoms/PriorityBadge";

export interface ViewAnnouncementModalProps {
  announcement: AnnouncementItemDTO | null;
  onClose: () => void;
}

const TARGET_LABEL_MAP: Record<AnnouncementItemDTO["targetRole"], string> = {
  ALL: "Semua Pengguna",
  STUDENTS: "Peserta Ujian (Siswa)",
  PROCTORS: "Pengawas Ruangan",
  TEACHERS: "Guru / Pembuat Soal",
};

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const ViewAnnouncementModal: FC<ViewAnnouncementModalProps> = ({
  announcement,
  onClose,
}) => {
  return (
    <Modal
      open={Boolean(announcement)}
      onClose={onClose}
      title={announcement?.title || "Detail Pengumuman"}
      size="md"
    >
      {announcement && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={announcement.priority} />
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                <Megaphone className="h-3 w-3 text-[#0097a7]" />
                {TARGET_LABEL_MAP[announcement.targetRole] ||
                  announcement.targetRole}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {announcement.authorName}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDateTime(announcement.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {announcement.content}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewAnnouncementModal;
