"use client";

import type { FC } from "react";
import ExamFocusLayout from "@/shared-ui/layout/ExamFocusLayout";
import StudentLobbyIndexView from "../organisms/StudentLobbyIndexView";
import type { StudentProfileSummary } from "../organisms/StudentLobbyView";

export interface StudentLobbyIndexSectionProps {
  initialStudent?: StudentProfileSummary;
}

export const StudentLobbyIndexSection: FC<StudentLobbyIndexSectionProps> = ({
  initialStudent,
}) => {
  return (
    <ExamFocusLayout
      examTitle="Lobi Ujian Siswa"
      courseName="Pilih Ujian yang Tersedia"
      studentName={initialStudent?.name}
      studentId={initialStudent?.nisn || initialStudent?.username}
      roomCode={initialStudent?.roomName}
    >
      <StudentLobbyIndexView initialStudent={initialStudent} />
    </ExamFocusLayout>
  );
};

export default StudentLobbyIndexSection;
