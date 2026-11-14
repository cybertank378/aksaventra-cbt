"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";
import EditSeatModal from "../molecules/EditSeatModal";
import ExamParticipantsTable from "../organisms/ExamParticipantsTable";

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
          onClick={() => router.replace("/dashboard/exams")}
        >
          Kembali ke Daftar Ujian
        </Button>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => router.replace(`/dashboard/exams/${examId}/assign-groups`)}
        >
          Tugaskan Rombel Baru
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      <ExamParticipantsTable
        participants={filtered}
        totalParticipants={participants.length}
        search={search}
        isLoading={isLoading}
        onSearchChange={setSearch}
        onEditParticipant={handleOpenEdit}
      />

      <EditSeatModal
        participant={editingParticipant}
        customRoom={customRoom}
        customSeat={customSeat}
        isUpdating={isUpdating}
        onRoomChange={setCustomRoom}
        onSeatChange={setCustomSeat}
        onClose={() => setEditingParticipant(null)}
        onSave={handleSaveSeat}
      />
    </div>
  );
};

export default ExamParticipantsSection;
