"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import type { ExamStatusType } from "../atoms/ExamStatusBadge";
import ExamFilterBar from "../molecules/ExamFilterBar";
import ExamsTable, { type ExamItemView } from "../organisms/ExamsTable";

export interface ExamsManagementSectionProps {
  userRole?: UserRole;
}

export const ExamsManagementSection: FC<ExamsManagementSectionProps> = ({
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { examsList, fetchExamsList, isLoading, error } =
    useExamManagementApi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  // Map API ExamSnapshotDTO to UI ExamItemView
  const mappedExams: ExamItemView[] =
    examsList && examsList.length > 0
      ? examsList.map((e) => {
          const durationMins = Math.round((e.durationSeconds || 5400) / 60);
          const raw = e as unknown as {
            timeOpen?: string;
            timeClose?: string;
            status?: string;
          };
          const computedStatus: ExamStatusType =
            raw.status === "SCHEDULED" || raw.status === "COMPLETED"
              ? raw.status
              : raw.timeClose && new Date(raw.timeClose) < new Date()
                ? "COMPLETED"
                : raw.timeOpen && new Date(raw.timeOpen) > new Date()
                  ? "SCHEDULED"
                  : "ACTIVE";

          return {
            id: String(e.examId || e.moodleCbtId),
            title: e.title || e.courseName || `Ujian CBT #${e.examId}`,
            course: e.courseName || "-",
            durationMinutes: durationMins,
            totalQuestions: e.questions?.length || 0,
            startDate: raw.timeOpen
              ? new Date(raw.timeOpen).toLocaleDateString("id-ID")
              : "-",
            status: computedStatus,
          };
        })
      : [];

  const filteredExams = mappedExams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter !== "ALL" && e.status !== filter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <ExamFilterBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
        onRefresh={() => fetchExamsList()}
        onCreateExam={() => router.replace("/dashboard/exams/new")}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <ExamsTable
        exams={filteredExams}
        totalMappedCount={mappedExams.length}
        isLoading={isLoading}
        onCreateExam={() => router.push("/dashboard/exams/new")}
        onManageQuestions={(id) =>
          router.replace(`/dashboard/exams/${id}/questions`)
        }
        onManageParticipants={(id) =>
          router.replace(`/dashboard/exams/${id}/participants`)
        }
        onViewRecap={(id) =>
          router.replace(`/dashboard/exams/${id}/recapitulation`)
        }
        onOpenProctor={(id) => router.replace(`/dashboard/proctor/${id}`)}
      />
    </div>
  );
};

export default ExamsManagementSection;
