"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
import type { ExamStatusType } from "../atoms/ExamStatusBadge";
import EditExamModal from "../molecules/EditExamModal";
import ExamFilterBar from "../molecules/ExamFilterBar";
import ViewExamModal, {
  type ExamDetailViewModel,
} from "../molecules/ViewExamModal";
import ExamsTable, { type ExamItemView } from "../organisms/ExamsTable";

export interface ExamsManagementSectionProps {
  userRole?: UserRole;
}

export const ExamsManagementSection: FC<ExamsManagementSectionProps> = ({
  userRole: _userRole,
}) => {
  const router = useRouter();
  const {
    examsList,
    fetchExamsList,
    updateExam,
    deleteExam,
    isLoading,
    error,
  } = useExamManagementApi();
  const { subjects, fetchSubjects } = useQuestionsApi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL");
  const [viewingExam, setViewingExam] = useState<ExamDetailViewModel | null>(
    null,
  );
  const [editingExam, setEditingExam] = useState<ExamDetailViewModel | null>(
    null,
  );

  useEffect(() => {
    fetchExamsList();
    fetchSubjects();
    const handleSynced = () => {
      fetchExamsList();
      fetchSubjects();
    };
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchExamsList, fetchSubjects]);

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
            moodleCbtId: e.moodleCbtId,
            title: e.title || e.courseName || `Ujian CBT #${e.examId}`,
            course: e.courseName || "-",
            durationMinutes: durationMins,
            maxStrikes: e.maxStrikes || 3,
            activeToken: e.activeToken,
            totalQuestions: e.questions?.length || 0,
            timeOpen: raw.timeOpen,
            timeClose: raw.timeClose,
            startDate: raw.timeOpen
              ? new Date(raw.timeOpen).toLocaleDateString("id-ID")
              : "-",
            status: computedStatus,
          };
        })
      : [];

  const availableCourses = useMemo(() => {
    const set = new Set<string>(subjects);
    for (const ex of mappedExams) {
      if (ex.course && ex.course !== "-") set.add(ex.course);
    }
    return Array.from(set).sort();
  }, [subjects, mappedExams]);

  const filteredExams = mappedExams.filter((e) => {
    if (
      search &&
      !e.title.toLowerCase().includes(search.toLowerCase()) &&
      !e.course.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (filter !== "ALL" && e.status !== filter) {
      return false;
    }
    if (selectedCourse !== "ALL" && e.course !== selectedCourse) {
      return false;
    }
    return true;
  });

  const handleDeleteExam = async (examItem: ExamItemView) => {
    if (
      confirm(`Apakah Anda yakin ingin menghapus ujian "${examItem.title}"?`)
    ) {
      await deleteExam(examItem.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <ExamFilterBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        courses={availableCourses}
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
        onViewExam={(examItem) => setViewingExam(examItem)}
        onEditExam={(examItem) => setEditingExam(examItem)}
        onDeleteExam={handleDeleteExam}
        onAssignGroups={(id) =>
          router.replace(`/dashboard/exams/${id}/assign-groups`)
        }
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

      <ViewExamModal
        open={Boolean(viewingExam)}
        exam={viewingExam}
        onClose={() => setViewingExam(null)}
        onEdit={(ex) => setEditingExam(ex)}
        onAssignGroups={(id) =>
          router.replace(`/dashboard/exams/${id}/assign-groups`)
        }
      />

      <EditExamModal
        open={Boolean(editingExam)}
        exam={editingExam}
        subjects={availableCourses}
        onClose={() => setEditingExam(null)}
        onSave={async (id, data) => Boolean(await updateExam(id, data))}
      />
    </div>
  );
};

export default ExamsManagementSection;
