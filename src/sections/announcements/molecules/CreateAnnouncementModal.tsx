"use client";

import { useState } from "react";
import type {
  AnnouncementPriority,
  AnnouncementTarget,
  CreateAnnouncementInputDTO,
} from "@/modules/announcements/domain/dto/AnnouncementDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextAreaField from "@/shared-ui/component/TextAreaField";
import TextField from "@/shared-ui/component/TextField";

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
        <TextField
          id="ann-title"
          label="Judul Pengumuman:"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Tata Tertib Ujian Semester Ganjil..."
          size="sm"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            id="ann-priority"
            label="Prioritas:"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as AnnouncementPriority)
            }
            size="sm"
          >
            <option value="LOW">Info Santai (Low)</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Penting (High)</option>
            <option value="URGENT">Mendesak (Urgent)</option>
          </SelectField>

          <SelectField
            id="ann-target"
            label="Sasaran Penerima:"
            value={targetRole}
            onChange={(e) =>
              setTargetRole(e.target.value as AnnouncementTarget)
            }
            size="sm"
          >
            <option value="ALL">Semua Pengguna</option>
            <option value="STUDENTS">Khusus Siswa</option>
            <option value="PROCTORS">Khusus Pengawas Ruang</option>
            <option value="TEACHERS">Khusus Guru</option>
          </SelectField>
        </div>

        <TextAreaField
          id="ann-content"
          label="Isi Pengumuman:"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tuliskan isi instruksi secara lengkap..."
          size="sm"
          required
        />

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
