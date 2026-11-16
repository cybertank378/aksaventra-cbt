"use client";

import { type FC, useEffect, useState } from "react";
import type {
  ClassGroupDTO,
  UpdateClassGroupInputDTO,
} from "@/modules/classes/domain/dto/ClassGroupDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface EditClassModalProps {
  open: boolean;
  classGroup: ClassGroupDTO | null;
  onClose: () => void;
  onSave: (id: string, data: UpdateClassGroupInputDTO) => Promise<boolean>;
}

export const EditClassModal: FC<EditClassModalProps> = ({
  open,
  classGroup,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classGroup) {
      setName(classGroup.name);
      setCode(classGroup.code || "");
      setDescription(classGroup.description || "");
      setError(null);
    }
  }, [classGroup]);

  if (!classGroup) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kelas wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSave(classGroup.id, {
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
      });
      if (ok) {
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
      title="Edit Rombongan Belajar"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <TextField
          label="Nama Kelas *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Kode Kelas"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Contoh: X-RPL-1"
        />

        <TextField
          label="Deskripsi / Keterangan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Keterangan tambahan..."
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
            Simpan Kelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditClassModal;
