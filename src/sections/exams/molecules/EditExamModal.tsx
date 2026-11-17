"use client";

import { type FC, useEffect, useState } from "react";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import type { ExamDetailViewModel } from "./ViewExamModal";

export interface EditExamModalProps {
  open: boolean;
  exam: ExamDetailViewModel | null;
  subjects: string[];
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      title: string;
      courseName: string;
      durationSeconds: number;
      maxStrikes: number;
      activeToken?: string;
      tokenExpiresAt?: string;
      timeOpen?: string;
      timeClose?: string;
    },
  ) => Promise<boolean>;
}

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export const EditExamModal: FC<EditExamModalProps> = ({
  open,
  exam,
  subjects,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [maxStrikes, setMaxStrikes] = useState("3");
  const [activeToken, setActiveToken] = useState("");
  const [timeOpen, setTimeOpen] = useState("");
  const [timeClose, setTimeClose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setCourseName(exam.course);
      setDurationMinutes(String(exam.durationMinutes || 90));
      setMaxStrikes(String(exam.maxStrikes || 3));
      setActiveToken(exam.activeToken || "");
      setTimeOpen(toDatetimeLocalValue(exam.timeOpen));
      setTimeClose(toDatetimeLocalValue(exam.timeClose));
      setError(null);
    }
  }, [exam]);

  if (!exam) return null;

  const subjectOptions = Array.from(
    new Set([courseName, ...subjects].filter(Boolean)),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseName.trim()) {
      setError("Judul ujian dan Mata Pelajaran wajib diisi");
      return;
    }

    const durationMinsNum = Math.max(1, Number(durationMinutes) || 90);
    const strikesNum = Math.max(1, Number(maxStrikes) || 3);

    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSave(exam.id, {
        title: title.trim(),
        courseName: courseName.trim(),
        durationSeconds: durationMinsNum * 60,
        maxStrikes: strikesNum,
        ...(activeToken.trim()
          ? {
              activeToken: activeToken.trim().toUpperCase(),
              tokenExpiresAt: new Date(Date.now() + 7200 * 1000).toISOString(),
            }
          : {}),
        ...(timeOpen ? { timeOpen: new Date(timeOpen).toISOString() } : {}),
        ...(timeClose ? { timeClose: new Date(timeClose).toISOString() } : {}),
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Data Ujian CBT" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <TextField
          label="Judul Ujian *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Mata Pelajaran *"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          >
            {subjectOptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Token Aktif Ruang Ujian"
            value={activeToken}
            onChange={(e) => setActiveToken(e.target.value.toUpperCase())}
            placeholder="Contoh: CBT123"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Durasi (Menit) *"
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
          <TextField
            label="Batas Maksimal Pelanggaran (Strikes)"
            type="number"
            min={1}
            value={maxStrikes}
            onChange={(e) => setMaxStrikes(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Waktu Mulai"
            type="datetime-local"
            value={timeOpen}
            onChange={(e) => setTimeOpen(e.target.value)}
          />
          <TextField
            label="Waktu Tutup"
            type="datetime-local"
            value={timeClose}
            onChange={(e) => setTimeClose(e.target.value)}
          />
        </div>

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

export default EditExamModal;
