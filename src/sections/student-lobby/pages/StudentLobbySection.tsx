"use client";

import type { FC } from "react";
import ExamFocusLayout from "@/shared-ui/layout/ExamFocusLayout";
import StudentLobbyView, {
  type StudentExamMeta,
  type StudentProfileSummary,
} from "../organisms/StudentLobbyView";

export interface StudentLobbySectionProps {
  examId: string;
  initialExam?: StudentExamMeta;
  initialStudent?: StudentProfileSummary;
}

export const StudentLobbySection: FC<StudentLobbySectionProps> = ({
  examId,
  initialExam,
  initialStudent,
}) => {
  return (
    <ExamFocusLayout
      examTitle={initialExam?.title || "Lobi Ujian Siswa"}
      courseName={initialExam?.courseName || "Aksaventra CBT"}
      studentName={initialStudent?.name}
      studentId={initialStudent?.nisn || initialStudent?.username}
      roomCode={initialStudent?.roomName}
    >
      <StudentLobbyView
        examId={examId}
        initialExam={initialExam}
        initialStudent={initialStudent}
      />
    </ExamFocusLayout>
  );
};

export default StudentLobbySection;
