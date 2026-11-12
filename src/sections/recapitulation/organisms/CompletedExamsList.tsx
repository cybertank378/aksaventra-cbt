"use client";

import { ArrowRight, Award, BarChart3, Clock, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

export const CompletedExamsList: FC = () => {
  const router = useRouter();
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

  const handleViewRecap = (examId: number | string) => {
    router.replace(`/dashboard/exams/${examId}/recapitulation`);
  };

  const handleViewResults = (examId: number | string) => {
    router.replace(`/dashboard/results/${examId}`);
  };

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
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ujian atau mata pelajaran..."
            leftIcon={Search}
            size="sm"
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
            <Card
              key={item.examId}
              className="flex flex-col justify-between p-5 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge color="success" size="sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                    Tersedia Rekap
                  </Badge>
                  <Badge color="neutral" size="sm" className="font-bold">
                    <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {(item as unknown as { passingGrade?: number }).passingGrade
                      ? `KKM ${(item as unknown as { passingGrade?: number }).passingGrade}`
                      : "KKM Asesmen"}
                  </Badge>
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
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => handleViewRecap(item.examId)}
                >
                  Rekap KKM
                </Button>

                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="sm"
                  fullWidth
                  rightIcon={ArrowRight}
                  onClick={() => handleViewResults(item.examId)}
                >
                  Rincian
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedExamsList;
