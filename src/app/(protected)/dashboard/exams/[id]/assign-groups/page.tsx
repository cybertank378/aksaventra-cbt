"use client";

import { ArrowLeft, Check, CheckSquare, Users } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";
import AppLayout from "@/shared-ui/layout/AppLayout";

interface AssignGroupsPageProps {
  params: Promise<{ id: string }>;
}

function AssignGroupsContent({ params }: AssignGroupsPageProps) {
  const { id: examId } = use(params);

  const { classes, fetchClasses } = useClassesApi();
  const { participants, isLoading, error, assignGroups, fetchParticipants } =
    useExamManagementApi(examId);

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [roomCode, setRoomCode] = useState("LAB-01");
  const [seatPrefix, setSeatPrefix] = useState("M");
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchParticipants(examId);
  }, [fetchClasses, fetchParticipants, examId]);

  const toggleClassSelect = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    );
  };

  const handleAssign = async () => {
    if (selectedClassIds.length === 0) return;
    const success = await assignGroups({
      classGroupIds: selectedClassIds,
      roomCode,
      seatPrefix,
      targetExamId: examId,
    });
    if (success) {
      setAssignedSuccess(true);
      fetchParticipants(examId);
    }
  };

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Pengampu",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Penugasan Kelas & Alokasi Nomor Meja"
      subtitle="Tetapkan rombongan belajar peserta ujian dan generate alokasi meja secara berurutan"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/exams">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={ArrowLeft}
            >
              Kembali ke Daftar Ujian
            </Button>
          </Link>

          <Link href={`/dashboard/exams/${examId}/participants`}>
            <Button
              type="button"
              variant="outline"
              color="primary"
              size="sm"
              leftIcon={Users}
            >
              Lihat Daftar Peserta &amp; Meja
            </Button>
          </Link>
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Class Selection */}
          <div className="lg:col-span-2 flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pilih Rombongan Belajar (Kelas / Cohort)
              </h2>
              <p className="text-xs text-slate-500">
                Pilih satu atau beberapa kelas yang wajib mengikuti asesmen ini
              </p>
            </div>

            {classes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada data kelas. Tambahkan kelas di menu{" "}
                <Link
                  href="/dashboard/classes"
                  className="text-[#0097a7] underline"
                >
                  Kelas &amp; Rombel
                </Link>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classes.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClassSelect(cls.id)}
                      className={`flex items-start justify-between p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-teal-50/60 border-[#0097a7] ring-1 ring-[#0097a7]"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {cls.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cls.studentCount || 0} Siswa Terdaftar
                        </p>
                      </div>

                      <div
                        className={`p-1 rounded-lg border ${
                          isSelected
                            ? "bg-[#0097a7] text-white border-[#0097a7]"
                            : "bg-slate-100 text-transparent border-slate-200"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Room & Seat Configuration */}
          <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs h-fit">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alokasi Ruang &amp; Meja
              </h2>
              <p className="text-xs text-slate-500">
                Konfigurasi penempatan nomor meja otomatis
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="room-code-input"
                className="text-xs font-semibold text-slate-700"
              >
                Nama / Kode Ruang Ujian
              </label>
              <input
                id="room-code-input"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="LAB-01"
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="seat-prefix-input"
                className="text-xs font-semibold text-slate-700"
              >
                Prefix Nomor Meja
              </label>
              <input
                id="seat-prefix-input"
                type="text"
                value={seatPrefix}
                onChange={(e) => setSeatPrefix(e.target.value)}
                placeholder="Contoh: M (menghasilkan M-01, M-02, dst)"
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600">{error}</p>
            )}
            {assignedSuccess && (
              <p className="text-xs font-semibold text-emerald-600">
                Rombel berhasil ditugaskan &amp; nomor meja digenerate!
              </p>
            )}

            <Button
              type="button"
              variant="filled"
              color="primary"
              size="md"
              loading={isLoading}
              disabled={selectedClassIds.length === 0}
              onClick={handleAssign}
              leftIcon={CheckSquare}
            >
              Tugaskan &amp; Generate Meja
            </Button>
          </div>
        </div>

        {/* Preview of Assigned Participants and Seat Numbers */}
        {participants.length > 0 && (
          <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Peserta &amp; Alokasi Nomor Meja ({participants.length}{" "}
                  Siswa)
                </h3>
                <p className="text-xs text-slate-500">
                  Nomor meja diurutkan otomatis berdasarkan urutan absen kelas
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">Nomor Meja</th>
                    <th className="px-4 py-3">Ruang Ujian</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">NIS / Username</th>
                    <th className="px-4 py-3">Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.map((p) => (
                    <tr key={p.studentId} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#0d2b5c] text-white">
                          {p.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-[#0097a7]">
                        {p.roomCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {p.username}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {p.className || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function AssignGroupsPage({ params }: AssignGroupsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <AssignGroupsContent params={params} />
    </Suspense>
  );
}
