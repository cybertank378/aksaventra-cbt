"use client";

import { Clock, KeyRound, ShieldAlert } from "lucide-react";
import type React from "react";
import { type FC, useEffect, useState } from "react";
import Button from "@/shared-ui/component/Button";
import TextField from "@/shared-ui/component/TextField";

export interface CreateExamFormPayload {
  title: string;
  courseName: string;
  durationMinutes: number;
  maxStrikes: number;
  activeToken: string;
  timeOpen: string;
  timeClose: string;
  sebRequired: boolean;
}

interface CreateExamFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (payload: CreateExamFormPayload) => Promise<void>;
  onCancel: () => void;
}

export const CreateExamForm: FC<CreateExamFormProps> = ({
  isLoading,
  error,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [maxStrikes, setMaxStrikes] = useState(3);
  const [activeToken, setActiveToken] = useState("");
  const [timeOpen, setTimeOpen] = useState("");
  const [timeClose, setTimeClose] = useState("");
  const [sebRequired, setSebRequired] = useState(false);

  useEffect(() => {
    setTimeOpen(new Date().toISOString().slice(0, 16));
    setTimeClose(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      courseName,
      durationMinutes,
      maxStrikes,
      activeToken,
      timeOpen: new Date(timeOpen).toISOString(),
      timeClose: new Date(timeClose).toISOString(),
      sebRequired,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Informasi Umum Asesmen
        </h2>
        <p className="text-xs text-slate-500">
          Lengkapi rincian nama ujian dan sinkronisasi course Moodle
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <TextField
            id="exam-title"
            label="Nama / Judul Ujian (Wajib)"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Penilaian Akhir Semester - Matematika Terapan XII"
            size="sm"
          />
        </div>

        <TextField
          id="course-name"
          label="Mata Pelajaran (Course Name)"
          type="text"
          required
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Contoh: Matematika Peminatan"
          size="sm"
        />

        <TextField
          id="duration-mins"
          label="Durasi Pengerjaan (Menit)"
          type="number"
          min={10}
          max={360}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          leftIcon={Clock}
          size="sm"
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Token &amp; Kebijakan Keamanan Ujian
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Konfigurasi token proyektor dan batas toleransi pelanggaran
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            id="exam-token"
            label="Token Awal 6-Digit (Wajib)"
            type="text"
            required
            maxLengthValue={10}
            placeholder="Contoh: AKSA88"
            value={activeToken}
            onChange={(e) => setActiveToken(e.target.value.toUpperCase())}
            leftIcon={KeyRound}
            size="sm"
            className="font-mono font-bold tracking-widest text-[#0d2b5c] uppercase"
          />

          <TextField
            id="max-strikes"
            label="Batas Maksimal Strike Pelanggaran"
            type="number"
            min={1}
            max={10}
            value={maxStrikes}
            onChange={(e) => setMaxStrikes(Number(e.target.value))}
            leftIcon={ShieldAlert}
            size="sm"
          />

          <TextField
            id="time-open"
            label="Waktu Mulai Buka Ujian"
            type="datetime-local"
            required
            value={timeOpen}
            onChange={(e) => setTimeOpen(e.target.value)}
            size="sm"
          />

          <TextField
            id="time-close"
            label="Waktu Selesai / Tutup Ujian"
            type="datetime-local"
            required
            value={timeClose}
            onChange={(e) => setTimeClose(e.target.value)}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2 mt-4 pt-2">
          <input
            id="seb-chk"
            type="checkbox"
            checked={sebRequired}
            onChange={(e) => setSebRequired(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0097a7] focus:ring-[#0097a7]"
          />
          <label
            htmlFor="seb-chk"
            className="text-xs text-slate-700 font-semibold cursor-pointer"
          >
            Wajibkan Safe Exam Browser (SEB Mode)
          </label>
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="filled"
          color="primary"
          loading={isLoading}
        >
          Simpan &amp; Lanjutkan ke Penugasan Kelas
        </Button>
      </div>
    </form>
  );
};

export default CreateExamForm;
