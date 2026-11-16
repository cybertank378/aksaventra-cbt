"use client";

import { type FC, useEffect, useState } from "react";
import type {
  ClassGroupDTO,
  StudentDTO,
  UpdateStudentInputDTO,
} from "@/modules/classes/domain/dto/ClassGroupDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

export interface EditStudentModalProps {
  open: boolean;
  student: StudentDTO | null;
  classes: ClassGroupDTO[];
  onClose: () => void;
  onSave: (id: string, data: UpdateStudentInputDTO) => Promise<boolean>;
}

export const EditStudentModal: FC<EditStudentModalProps> = ({
  open,
  student,
  classes,
  onClose,
  onSave,
}) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setUsername(student.username);
      setFullName(student.fullName);
      setPassword("");
      setClassGroupId(student.classGroupId || "");
      setRoomCode(student.roomCode || "LAB-01");
      setIsActive(student.isActive);
      setError(null);
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      setError("NIS/Username dan Nama Lengkap wajib diisi");
      return;
    }

    const selectedClass = classes.find((c) => c.id === classGroupId);
    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSave(student.id, {
        username: username.trim(),
        fullName: fullName.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
        classGroupId: classGroupId || null,
        className: selectedClass?.name || null,
        roomCode: roomCode.trim() || "LAB-01",
        isActive,
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
      title="Edit Data Siswa & Pengelompokan Kelas"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="NIS / Username *"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Ruang Ujian Default"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Contoh: LAB-01"
          />
        </div>

        <TextField
          label="Nama Lengkap Siswa *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Rombongan Belajar (Kelas)"
            value={classGroupId}
            onChange={(e) => setClassGroupId(e.target.value)}
          >
            <option value="">-- Belum ditentukan --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Status Akun"
            value={isActive ? "ACTIVE" : "INACTIVE"}
            onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
          >
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </SelectField>
        </div>

        <TextField
          label="Password Baru (Opsional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kosongkan jika tidak ingin mengubah password"
          enablePasswordToggle
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
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStudentModal;
