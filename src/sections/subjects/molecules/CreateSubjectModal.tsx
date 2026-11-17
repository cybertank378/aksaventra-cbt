"use client";

import { type FC, useState } from "react";
import type { CreateSubjectInputDTO } from "@/modules/subjects/domain/dto/SubjectDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface CreateSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubjectInputDTO) => Promise<boolean>;
}

export const CreateSubjectModal: FC<CreateSubjectModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama mata pelajaran wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSubmit({
        name: name.trim(),
        shortName: shortName.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (ok) {
        setName("");
        setShortName("");
        setDescription("");
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Mata Pelajaran"
      size="md"
    >
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
          placeholder="Contoh: Matematika Wajib"
          required
        />

        <TextField
          label="Kode Singkat (Short Name)"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          placeholder="Contoh: MAT-W"
        />

        <TextField
          label="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ringkasan silabus atau keterangan mapel..."
        />

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
            Simpan Mapel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSubjectModal;
