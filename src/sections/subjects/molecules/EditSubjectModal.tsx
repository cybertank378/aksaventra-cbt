"use client";

import { type FC, useEffect, useState } from "react";
import type {
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "@/modules/subjects/domain/dto/SubjectDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface EditSubjectModalProps {
  open: boolean;
  subject: SubjectDTO | null;
  onClose: () => void;
  onSave: (id: string, data: UpdateSubjectInputDTO) => Promise<boolean>;
}

export const EditSubjectModal: FC<EditSubjectModalProps> = ({
  open,
  subject,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setShortName(subject.shortName || "");
      setDescription(subject.description || "");
      setIsVisible(subject.isVisible ?? true);
      setError(null);
    }
  }, [subject]);

  if (!subject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama mata pelajaran wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSave(subject.id, {
        name: name.trim(),
        shortName: shortName.trim() || null,
        description: description.trim() || null,
        isVisible,
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Mata Pelajaran" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <TextField
          label="Nama Mata Pelajaran *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Kode Singkat"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          placeholder="Contoh: MAT-W"
        />

        <TextField
          label="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0097a7] focus:ring-[#0097a7]"
          />
          <span>Tampilkan course di Moodle (Visible)</span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="sm"
            loading={isLoading}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSubjectModal;
