"use client";

import { ArrowLeft, Edit3, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

export interface ExamParticipantsSectionProps {
  examId: string;
  userRole?: UserRole;
}

export const ExamParticipantsSection: FC<ExamParticipantsSectionProps> = ({
  examId,
  userRole: _userRole,
}) => {
  const router = useRouter();
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

  const handleBackToExams = () => {
    router.replace("/dashboard/exams");
  };

  const handleAssignGroups = () => {
    router.replace(`/dashboard/exams/${examId}/assign-groups`);
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
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleBackToExams}
        >
          Kembali ke Daftar Ujian
        </Button>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          onClick={handleAssignGroups}
        >
          Tugaskan Rombel Baru
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex-1 max-w-md">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, atau nomor meja..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong>{filtered.length}</strong> Peserta Terdaftar
        </span>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-5 py-3.5">Nomor Meja</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">Ruang</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">Nama Siswa</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">NIS / Username</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">Kelas</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5 text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-12 text-center">
                  <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  Belum ada siswa yang ditugaskan ke ujian ini.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.studentId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="px-5 py-3.5 whitespace-nowrap">
                    <Badge color="primary" variant="filled" size="sm" className="font-mono font-black text-xs">
                      {p.seatNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 whitespace-nowrap font-bold text-[#0097a7]">
                    {p.roomCode}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-bold text-slate-900">
                    {p.fullName}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-slate-600">
                    {p.username}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                    {p.className || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right whitespace-nowrap">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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

            <TextField
              id="custom-room-input"
              label="Ruang Ujian"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              size="sm"
            />

            <TextField
              id="custom-seat-input"
              label="Nomor Meja"
              value={customSeat}
              onChange={(e) => setCustomSeat(e.target.value)}
              size="sm"
              className="font-mono font-bold text-[#0d2b5c]"
            />

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
  );
};

export default ExamParticipantsSection;
