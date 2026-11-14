"use client";

import { type FC, useState } from "react";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code?: string;
    description?: string;
  }) => Promise<boolean>;
}

export const CreateClassModal: FC<CreateClassModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kelas wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const success = await onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (success) {
        setName("");
        setCode("");
        setDescription("");
        onClose();
      } else {
        setError("Gagal menyimpan data kelas.");
      }
    } catch {
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !isLoading && onClose()}
      title="Tambah Rombel / Kelas Baru"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <TextField
          id="class-name"
          label="Nama Kelas (Wajib)"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: XII MIPA 1 atau X RPL 2"
          size="sm"
        />

        <TextField
          id="class-code"
          label="Kode Rombel / Cohort (Opsional)"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Contoh: 12-MIPA-1"
          size="sm"
        />

        <TextField
          id="class-desc"
          label="Keterangan / Jurusan (Opsional)"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Jurusan MIPA Pagi"
          size="sm"
        />

        {error && (
          <p className="text-xs font-semibold text-rose-600">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            loading={isLoading}
          >
            Simpan Kelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassModal;
