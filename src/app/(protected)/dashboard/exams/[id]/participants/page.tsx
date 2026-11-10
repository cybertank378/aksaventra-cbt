"use client";

import { ArrowLeft, Edit3, Search } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import AppLayout from "@/shared-ui/layout/AppLayout";

interface ExamParticipantsPageProps {
  params: Promise<{ id: string }>;
}

function ExamParticipantsContent({ params }: ExamParticipantsPageProps) {
  const { id: examId } = use(params);
  const { participants, isLoading, error, fetchParticipants, updateSeat } =
    useExamManagementApi(examId);

  const [search, setSearch] = useState("");
  const [editingParticipant, setEditingParticipant] =
    useState<ExamParticipantDTO | null>(null);
  const [customRoom, setCustomRoom] = useState("");
  const [customSeat, setCustomSeat] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchParticipants(examId);
  }, [fetchParticipants, examId]);

  const handleOpenEdit = (p: ExamParticipantDTO) => {
    setEditingParticipant(p);
    setCustomRoom(p.roomCode);
    setCustomSeat(p.seatNumber);
  };

  const handleSaveSeat = async () => {
    if (!editingParticipant) return;
    setIsUpdating(true);
    const success = await updateSeat(
      editingParticipant.studentId,
      customRoom.trim() || editingParticipant.roomCode,
      customSeat.trim() || editingParticipant.seatNumber,
    );
    setIsUpdating(false);
    if (success) {
      setEditingParticipant(null);
      fetchParticipants(examId);
    }
  };

  const filtered = participants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.seatNumber.toLowerCase().includes(q)
    );
  });

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
      title="Daftar Peserta & Penempatan Meja"
      subtitle="Pengaturan nomor meja dan penempatan ruang ujian siswa secara manual"
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <Link href={`/dashboard/exams/${examId}/assign-groups`}>
            <Button type="button" variant="filled" color="primary" size="sm">
              Tugaskan Rombel Baru
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama, NIS, atau nomor meja..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Total: <strong>{filtered.length}</strong> Peserta Terdaftar
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Nomor Meja</th>
                  <th className="px-5 py-3.5">Ruang</th>
                  <th className="px-5 py-3.5">Nama Siswa</th>
                  <th className="px-5 py-3.5">NIS / Username</th>
                  <th className="px-5 py-3.5">Kelas</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-slate-400"
                    >
                      Belum ada siswa yang ditugaskan ke ujian ini.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.studentId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#0d2b5c] text-white">
                          {p.seatNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-[#0097a7]">
                        {p.roomCode}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {p.username}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {p.className || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          color="secondary"
                          size="sm"
                          leftIcon={Edit3}
                          onClick={() => handleOpenEdit(p)}
                        >
                          Ubah Meja
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Edit Seat Number */}
        <Modal
          open={Boolean(editingParticipant)}
          onClose={() => setEditingParticipant(null)}
          title="Ubah Penempatan Ruang & Nomor Meja"
          size="sm"
        >
          {editingParticipant && (
            <div className="flex flex-col gap-4 py-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-900">
                  {editingParticipant.fullName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  NIS: {editingParticipant.username} | Kelas:{" "}
                  {editingParticipant.className}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="custom-room-input"
                  className="text-xs font-semibold text-slate-700"
                >
                  Ruang Ujian
                </label>
                <input
                  id="custom-room-input"
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="custom-seat-input"
                  className="text-xs font-semibold text-slate-700"
                >
                  Nomor Meja
                </label>
                <input
                  id="custom-seat-input"
                  type="text"
                  value={customSeat}
                  onChange={(e) => setCustomSeat(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-[#0d2b5c] focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  onClick={() => setEditingParticipant(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  loading={isUpdating}
                  onClick={handleSaveSeat}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

export default function ExamParticipantsPage({
  params,
}: ExamParticipantsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamParticipantsContent params={params} />
    </Suspense>
  );
}
