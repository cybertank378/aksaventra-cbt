"use client";

import {
  ArrowRight,
  Clock,
  KeyRound,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { type FC, useEffect } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";

export const ProctorDashboard: FC = () => {
  const { examsList, fetchExamsList, isLoading } = useExamManagementApi();

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  const proctorRooms = examsList.map((e) => {
    return {
      examId: String(e.examId || e.moodleCbtId),
      examTitle: e.title || e.courseName || `Ujian #${e.examId}`,
      roomCode: "LAB-01",
      roomName: "Laboratorium CBT",
      totalStudents: e.questions?.length || 0,
      activeToken: e.activeToken || "AKSA88",
      startTime: "Hari ini",
      durationMinutes: Math.round((e.durationSeconds || 5400) / 60),
      status: "ACTIVE" as const,
    };
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Proctor Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d2b5c] via-[#0097a7] to-[#0d2b5c] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            Ruang Kendali Pengawas (Proctor Workspace)
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Selamat Bertugas, Pengawas CBT
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 mt-1 max-w-xl">
            Awasi jalannya ujian secara langsung, lakukan intervensi peserta
            yang terkunci, dan tampilkan token pada proyektor LCD ruang ujian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/proctor">
            <Button
              type="button"
              variant="filled"
              size="md"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold"
            >
              Command Center Proktor
            </Button>
          </Link>
        </div>
      </div>

      {/* Proctor Rooms Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Daftar Sesi Ujian &amp; Ruang Kendali Pengawasan
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {proctorRooms.length} Sesi Terjadwal
          </span>
        </div>

        {isLoading && proctorRooms.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              Memuat data pengawasan ujian...
            </p>
          </div>
        ) : proctorRooms.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs">
            Belum ada jadwal sesi ujian yang ditugaskan ke pengawas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proctorRooms.map((room) => {
              const isActive = room.status === "ACTIVE";
              return (
                <div
                  key={room.examId}
                  className={`flex flex-col justify-between rounded-3xl bg-white border p-5 sm:p-6 shadow-xs transition-all ${
                    isActive
                      ? "border-teal-400/80 ring-2 ring-teal-400/20"
                      : "border-slate-200/90"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-[#0097a7] uppercase tracking-wider">
                        {room.roomCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isActive
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        )}
                        {isActive ? "Sedang Berlangsung" : "Terjadwal"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {room.examTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {room.roomName}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">
                          Token Ruang Ujian
                        </span>
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span className="text-lg font-black tracking-widest text-[#0d2b5c] font-mono">
                            {room.activeToken}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">
                          Waktu Pelaksanaan
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.startTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Durasi: <strong>{room.durationMinutes} Menit</strong>
                    </span>

                    <Link href={`/dashboard/proctor/${room.examId}`}>
                      <Button
                        type="button"
                        variant="filled"
                        color={isActive ? "primary" : "secondary"}
                        size="sm"
                        rightIcon={ArrowRight}
                      >
                        Buka Ruang Pengawas
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;
