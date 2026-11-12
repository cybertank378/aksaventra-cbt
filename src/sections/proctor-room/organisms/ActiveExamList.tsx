"use client";

import { ArrowRight, Clock, KeyRound, Radio, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

export const ActiveExamList: FC = () => {
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

  const handleOpenProctor = (examId: number | string) => {
    router.replace(`/dashboard/proctor/${examId}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Daftar Ujian Aktif & Terjadwal
          </h2>
          <p className="text-xs text-slate-500">
            Pilih sesi ruang ujian untuk membuka Live Proctoring Command Center
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

      {/* Grid of Exams */}
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
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <Radio className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Tidak ada sesi ujian yang ditemukan
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Silakan jadwalkan ujian baru melalui menu Kelola Ujian
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
                  <Badge color="teal" size="sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0097a7] animate-pulse mr-1" />
                    Live Monitoring
                  </Badge>
                  <Badge color="neutral" size="sm" className="font-mono font-bold">
                    <KeyRound className="w-3 h-3 mr-1 text-slate-400" />
                    {item.activeToken || "-"}
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
                    <span>{Math.round(item.durationSeconds / 60)} Menit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.questions?.length || 0} Soal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="sm"
                  fullWidth
                  rightIcon={ArrowRight}
                  onClick={() => handleOpenProctor(item.examId)}
                >
                  Buka Ruang Pengawas
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveExamList;
