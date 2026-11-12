"use client";

import { type FC, useState } from "react";
import type { ClassGroupDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

export interface CreateStudentModalProps {
  open: boolean;
  classes: ClassGroupDTO[];
  onClose: () => void;
  onSubmit: (data: {
    username: string;
    fullName: string;
    email?: string;
    password?: string;
    classGroupId?: string;
    className?: string;
    roomCode?: string;
  }) => Promise<boolean>;
}

export const CreateStudentModal: FC<CreateStudentModalProps> = ({
  open,
  classes,
  onClose,
  onSubmit,
}) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      setError("NIS/Username dan Nama Lengkap wajib diisi");
      return;
    }

    const selectedClass = classes.find((c) => c.id === selectedClassId);

    setIsLoading(true);
    setError(null);
    try {
      const success = await onSubmit({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        classGroupId: selectedClassId || undefined,
        className: selectedClass?.name || undefined,
        roomCode: roomCode.trim() || undefined,
      });

      if (success) {
        setUsername("");
        setFullName("");
        setEmail("");
        setPassword("");
        setRoomCode("");
        onClose();
      } else {
        setError("Gagal mendaftarkan siswa baru.");
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
      title="Daftarkan Akun Siswa Baru"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <TextField
          id="student-nis"
          label="NIS / Username Login (Wajib)"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Contoh: 20261001 atau NISN"
          size="sm"
        />

        <TextField
          id="student-name"
          label="Nama Lengkap Siswa (Wajib)"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Contoh: Muhammad Farhan Pratama"
          size="sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            id="student-class"
            label="Pilihan Kelas / Rombel"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            size="sm"
          >
            <option value="">Pilih Rombel...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>

          <TextField
            id="student-room"
            label="Alokasi Ruang Default"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="LAB-01"
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="student-email"
            label="Email (Opsional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siswa@aksaventra.sch.id"
            size="sm"
          />

          <TextField
            id="student-pwd"
            label="Password Awal"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Siswa123*"
            size="sm"
          />
        </div>

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
            Daftarkan Siswa
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStudentModal;
