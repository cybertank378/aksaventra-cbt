"use client";

import type { FC } from "react";
import type { QuestionItemDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import ExamWorkspaceView from "../organisms/ExamWorkspaceView";

export interface ExamWorkspaceSectionProps {
  attemptId: string;
  examId?: string;
  examTitle?: string;
  studentName?: string;
  durationSeconds?: number;
  timeStartSec?: number;
  extraTimeSeconds?: number;
  serverTimestampSec?: number;
  questions?: QuestionItemDTO[];
  maxStrikes?: number;
}

const defaultMockQuestions: QuestionItemDTO[] = [
  {
    slot: 1,
    questionId: 101,
    type: "multichoice",
    stemHtml:
      "<p>Jika persamaan kuadrat $x^2 - 5x + 6 = 0$ memiliki akar-akar $x_1$ dan $x_2$, berapakah nilai dari $x_1 + x_2$?</p>",
    options: [
      { key: "A", html: "<p>$-5$</p>" },
      { key: "B", html: "<p>$5$</p>" },
      { key: "C", html: "<p>$6$</p>" },
      { key: "D", html: "<p>$-6$</p>" },
      { key: "E", html: "<p>$1$</p>" },
    ],
  },
  {
    slot: 2,
    questionId: 102,
    type: "multichoice",
    stemHtml:
      "<p>Manakah dari proses termodinamika berikut yang berlangsung pada <em>tekanan konstan</em>?</p>",
    options: [
      { key: "A", html: "<p>Isotermal</p>" },
      { key: "B", html: "<p>Isokhorik</p>" },
      { key: "C", html: "<p>Isobarik</p>" },
      { key: "D", html: "<p>Adiabatik</p>" },
      { key: "E", html: "<p>Polistropik</p>" },
    ],
  },
];

export const ExamWorkspaceSection: FC<ExamWorkspaceSectionProps> = ({
  attemptId,
  examId = "exam-1",
  examTitle = "Ujian Penilaian Akhir Semester CBT",
  studentName = "Peserta Ujian",
  durationSeconds = 5400,
  timeStartSec = Math.floor(Date.now() / 1000),
  extraTimeSeconds = 0,
  serverTimestampSec,
  questions = defaultMockQuestions,
  maxStrikes = 3,
}) => {
  return (
    <main className="min-h-screen bg-slate-100/90 py-4 sm:py-6 px-4 md:px-6 select-none">
      <ExamWorkspaceView
        attemptId={attemptId}
        examId={examId}
        examTitle={examTitle}
        studentName={studentName}
        durationSeconds={durationSeconds}
        timeStartSec={timeStartSec}
        extraTimeSeconds={extraTimeSeconds}
        serverTimestampSec={serverTimestampSec}
        questions={questions}
        maxStrikes={maxStrikes}
      />
    </main>
  );
};

export default ExamWorkspaceSection;
