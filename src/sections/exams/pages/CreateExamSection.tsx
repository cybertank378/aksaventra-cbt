"use client";

import { ArrowLeft, Clock, KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";

export interface CreateExamSectionProps {
  userRole?: UserRole;
}

export const CreateExamSection: FC<CreateExamSectionProps> = ({
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { createSchedule, isLoading, error } = useExamManagementApi();

  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [maxStrikes, setMaxStrikes] = useState(3);
  const [activeToken, setActiveToken] = useState("AKSA88");
  const [timeOpen, setTimeOpen] = useState("");
  const [timeClose, setTimeClose] = useState("");
  const [sebRequired, setSebRequired] = useState(false);

  useEffect(() => {
    setTimeOpen(new Date().toISOString().slice(0, 16));
    setTimeClose(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExamId = await createSchedule({
      title,
      courseName,
      durationMinutes,
      maxStrikes,
      activeToken,
      timeOpen: new Date(timeOpen).toISOString(),
      timeClose: new Date(timeClose).toISOString(),
      sebRequired,
    });

    if (newExamId) {
      router.push(`/dashboard/exams/${newExamId}/assign-groups`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/exams">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={ArrowLeft}
          >
            Kembali
          </Button>
        </Link>
      </div>

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
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="exam-title"
              className="text-xs font-semibold text-slate-700"
            >
              Nama / Judul Ujian (Wajib)
            </label>
            <input
              id="exam-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penilaian Akhir Semester - Matematika Terapan XII"
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="course-name"
              className="text-xs font-semibold text-slate-700"
            >
              Mata Pelajaran (Course Name)
            </label>
            <input
              id="course-name"
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Contoh: Matematika Peminatan"
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="duration-mins"
              className="text-xs font-semibold text-slate-700"
            >
              Durasi Pengerjaan (Menit)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="duration-mins"
                type="number"
                min={10}
                max={360}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Token &amp; Kebijakan Keamanan Ujian
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Konfigurasi token proyektor dan batas toleransi pelanggaran
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="exam-token"
                className="text-xs font-semibold text-slate-700"
              >
                Token Awal 6-Digit (Wajib)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="exam-token"
                  type="text"
                  required
                  maxLength={10}
                  value={activeToken}
                  onChange={(e) => setActiveToken(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-[#0d2b5c] uppercase focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="max-strikes"
                className="text-xs font-semibold text-slate-700"
              >
                Batas Maksimal Strike Pelanggaran
              </label>
              <div className="relative">
                <ShieldAlert className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="max-strikes"
                  type="number"
                  min={1}
                  max={10}
                  value={maxStrikes}
                  onChange={(e) => setMaxStrikes(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="time-open"
                className="text-xs font-semibold text-slate-700"
              >
                Waktu Mulai Buka Ujian
              </label>
              <input
                id="time-open"
                type="datetime-local"
                required
                value={timeOpen}
                onChange={(e) => setTimeOpen(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="time-close"
                className="text-xs font-semibold text-slate-700"
              >
                Waktu Selesai / Tutup Ujian
              </label>
              <input
                id="time-close"
                type="datetime-local"
                required
                value={timeClose}
                onChange={(e) => setTimeClose(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>
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
          <Link href="/dashboard/exams">
            <Button type="button" variant="outline" color="secondary">
              Batal
            </Button>
          </Link>
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
    </div>
  );
};

export default CreateExamSection;
