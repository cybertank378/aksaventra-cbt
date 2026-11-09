"use client";

import { useState } from "react";
import type {
  AnnouncementPriority,
  AnnouncementTarget,
  CreateAnnouncementInputDTO,
} from "@/modules/announcements/domain/dto/AnnouncementDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementInputDTO) => Promise<boolean>;
  loading: boolean;
}

export function CreateAnnouncementModal({
  open,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("NORMAL");
  const [targetRole, setTargetRole] = useState<AnnouncementTarget>("ALL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const success = await onSubmit({
      title,
      content,
      priority,
      targetRole,
    });

    if (success) {
      setTitle("");
      setContent("");
      setPriority("NORMAL");
      setTargetRole("ALL");
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Pengumuman Baru"
      subtitle="Siarkan informasi dan instruksi penting untuk siswa atau pengawas CBT"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="ann-title"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            Judul Pengumuman:
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tata Tertib Ujian Semester Ganjil..."
            className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ann-priority"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Prioritas:
            </label>
            <select
              id="ann-priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as AnnouncementPriority)
              }
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            >
              <option value="LOW">Info Santai (Low)</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Penting (High)</option>
              <option value="URGENT">Mendesak (Urgent)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ann-target"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Sasaran Penerima:
            </label>
            <select
              id="ann-target"
              value={targetRole}
              onChange={(e) =>
                setTargetRole(e.target.value as AnnouncementTarget)
              }
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            >
              <option value="ALL">Semua Pengguna</option>
              <option value="STUDENTS">Khusus Siswa</option>
              <option value="PROCTORS">Khusus Pengawas Ruang</option>
              <option value="TEACHERS">Khusus Guru</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="ann-content"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            Isi Pengumuman:
          </label>
          <textarea
            id="ann-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan isi instruksi secara lengkap..."
            className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            loading={loading}
          >
            Siarkan Pengumuman
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateAnnouncementModal;
