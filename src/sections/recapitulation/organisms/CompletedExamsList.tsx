"use client";

import { ArrowRight, Award, BarChart3, Clock, Users } from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";

export const CompletedExamsList: FC = () => {
  const { examsList, isLoading, error, fetchExamsList } =
    useExamManagementApi();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  const filteredExams = examsList.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.courseName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Laporan Rekapitulasi Hasil Ujian
          </h2>
          <p className="text-xs text-slate-500">
            Daftar sesi ujian selesai dan analisis ketercapaian KKM siswa
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ujian atau mata pelajaran..."
            className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Grid of Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Tidak ada laporan hasil ujian
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Laporan akan muncul setelah sesi ujian dilaksanakan oleh peserta
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((item) => (
            <div
              key={item.examId}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Tersedia Rekap
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    KKM 75.0
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0d2b5c] line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {item.courseName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{Math.round(item.durationSeconds / 60)} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.questions?.length || 0} Soal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 grid grid-cols-2 gap-2">
                <Link
                  href={`/dashboard/exams/${item.examId}/recapitulation`}
                  className="block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    size="sm"
                    fullWidth
                  >
                    Rekap KKM
                  </Button>
                </Link>

                <Link
                  href={`/dashboard/results/${item.examId}`}
                  className="block"
                >
                  <Button
                    type="button"
                    variant="filled"
                    color="primary"
                    size="sm"
                    fullWidth
                    rightIcon={ArrowRight}
                  >
                    Rincian
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedExamsList;
