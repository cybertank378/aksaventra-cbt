"use client";

import { ArrowLeft, LayoutGrid, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import ExamRoomSeatLayoutManager from "@/sections/classes/organisms/ExamRoomSeatLayoutManager";
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
  const {
    classes,
    students,
    isLoading: isClassesLoading,
    fetchClasses,
    fetchStudents,
    bulkAssignRoomAndSeats,
  } = useClassesApi();

  const [activeView, setActiveView] = useState<"TABLE" | "LAYOUT">("TABLE");
  const [search, setSearch] = useState("");
  const [editingParticipant, setEditingParticipant] =
    useState<ExamParticipantDTO | null>(null);
  const [customRoom, setCustomRoom] = useState("");
  const [customSeat, setCustomSeat] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    void fetchParticipants(examId);
    void fetchClasses();
    void fetchStudents();
  }, [fetchParticipants, fetchClasses, fetchStudents, examId]);

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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
            <Button
              type="button"
              size="sm"
              variant={activeView === "TABLE" ? "filled" : "ghost"}
              color={activeView === "TABLE" ? "primary" : "secondary"}
              leftIcon={Users}
              onClick={() => setActiveView("TABLE")}
              className="rounded-xl font-bold"
            >
              Tabel Peserta ({participants.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeView === "LAYOUT" ? "filled" : "ghost"}
              color={activeView === "LAYOUT" ? "teal" : "secondary"}
              leftIcon={LayoutGrid}
              onClick={() => setActiveView("LAYOUT")}
              className="rounded-xl font-bold"
            >
              Ruang &amp; Tata Letak Meja
            </Button>
          </div>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={() =>
              router.replace(`/dashboard/exams/${examId}/assign-groups`)
            }
          >
            Tugaskan Rombel Baru
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {activeView === "LAYOUT" ? (
        <ExamRoomSeatLayoutManager
          classes={classes}
          students={students}
          isLoading={isClassesLoading}
          examId={examId}
          onAssignRoomAndSeats={async (input) => {
            const ok = await bulkAssignRoomAndSeats(input);
            if (ok) {
              await fetchParticipants(examId);
            }
            return ok;
          }}
        />
      ) : (
        <ExamParticipantsTable
          participants={filtered}
          totalParticipants={participants.length}
          search={search}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onEditParticipant={handleOpenEdit}
        />
      )}

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
