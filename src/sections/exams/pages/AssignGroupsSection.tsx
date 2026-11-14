"use client";

import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";
import AssignGroupsForm from "../organisms/AssignGroupsForm";

export interface AssignGroupsSectionProps {
  examId: string;
  userRole?: UserRole;
}

export const AssignGroupsSection: FC<AssignGroupsSectionProps> = ({
  examId,
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { classes, fetchClasses } = useClassesApi();
  const { participants, isLoading, error, assignGroups, fetchParticipants } =
    useExamManagementApi(examId);

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [seatPrefix, setSeatPrefix] = useState("");
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
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
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
          variant="outline"
          color="primary"
          size="sm"
          leftIcon={Users}
          onClick={() => router.replace(`/dashboard/exams/${examId}/participants`)}
        >
          Lihat Daftar Peserta &amp; Meja
        </Button>
      </div>

      <AssignGroupsForm
        classes={classes}
        participants={participants}
        selectedClassIds={selectedClassIds}
        roomCode={roomCode}
        seatPrefix={seatPrefix}
        isLoading={isLoading}
        error={error}
        assignedSuccess={assignedSuccess}
        onToggleClass={toggleClassSelect}
        onRoomCodeChange={setRoomCode}
        onSeatPrefixChange={setSeatPrefix}
        onAssign={handleAssign}
        onOpenClasses={() => router.replace("/dashboard/classes")}
      />
    </div>
  );
};

export default AssignGroupsSection;
