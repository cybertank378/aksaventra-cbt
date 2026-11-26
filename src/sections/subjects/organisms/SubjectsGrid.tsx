"use client";

import {
  BookOpen,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import type { SubjectDTO } from "@/modules/subjects/domain/dto/SubjectDTO";
import { useSubjectsApi } from "@/modules/subjects/presentation/useSubjectsApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import SubjectCodeBadge from "../atoms/SubjectCodeBadge";
import CreateSubjectModal from "../molecules/CreateSubjectModal";
import EditSubjectModal from "../molecules/EditSubjectModal";
import ViewSubjectModal from "../molecules/ViewSubjectModal";

export const SubjectsGrid: FC = () => {
  const {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    fetchSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjectsApi();

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingSubject, setViewingSubject] = useState<SubjectDTO | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectDTO | null>(null);

  useEffect(() => {
    fetchSubjects();
    const handleSynced = () => fetchSubjects();
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchSubjects]);

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    for (const s of subjects) {
      for (const g of s.gradeLevels) {
        set.add(g);
      }
    }
    return Array.from(set).sort();
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchShort = (s.shortName || "").toLowerCase().includes(q);
        if (!matchName && !matchShort) return false;
      }
      if (gradeFilter !== "ALL") {
        return s.gradeLevels.includes(gradeFilter);
      }
      return true;
    });
  }, [subjects, search, gradeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, gradeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSubjects = useMemo(
    () =>
      filteredSubjects.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage,
      ),
    [filteredSubjects, safeCurrentPage, itemsPerPage],
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Manajemen Mata Pelajaran (Course / Subject)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola daftar mata pelajaran, pengelompokan tingkat kelas, dan
            sinkronisasi course Moodle
          </p>
        </div>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => setCreateOpen(true)}
        >
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex-1 max-w-md">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mata pelajaran atau kode singkat..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <SelectField
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            size="sm"
          >
            <option value="ALL">Semua Tingkat Kelas</option>
            {availableGrades.map((g) => (
              <option key={g} value={g}>
                Kelas {g}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Grid */}
      {isLoading && subjects.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Belum ada mata pelajaran ditemukan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSubjects.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#0097a7]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <SubjectCodeBadge name={s.name} shortName={s.shortName} />
                  {s.moodleCourseId && (
                    <Badge color="teal" size="sm" variant="soft">
                      Moodle #{s.moodleCourseId}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {s.description || "Tidak ada deskripsi tambahan."}
                </p>

                {s.gradeLevels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {s.gradeLevels.map((g) => (
                      <Badge key={g} color="neutral" size="sm">
                        Kelas {g}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#0097a7]" />
                    {s.questionCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#0d2b5c]" />
                    {s.examCount}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    size="sm"
                    leftIcon={Eye}
                    onClick={() => setViewingSubject(s)}
                  >
                    Lihat
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    color="primary"
                    size="sm"
                    leftIcon={Edit3}
                    onClick={() => setEditingSubject(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    color="error"
                    size="sm"
                    leftIcon={Trash2}
                    onClick={() => {
                      if (confirm(`Hapus mata pelajaran "${s.name}"?`)) {
                        deleteSubject(s.id);
                      }
                    }}
                    title="Hapus Mata Pelajaran"
                  />
                </div>
              </div>
            </div>
          ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 shadow-2xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-slate-500">
                Per halaman:
              </span>
              <SelectField
                value={String(itemsPerPage)}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                size="sm"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="50">50</option>
              </SelectField>
            </div>
            <div className="flex-1 w-full">
              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredSubjects.length}
                itemsPerPage={itemsPerPage}
                onPageChangeAction={(page) => {
                  setCurrentPage(page);
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      <CreateSubjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createSubject}
      />

      <ViewSubjectModal
        open={Boolean(viewingSubject)}
        subject={viewingSubject}
        onClose={() => setViewingSubject(null)}
        onLoadDetail={fetchSubjectById}
        onEdit={(sub) => setEditingSubject(sub)}
      />

      <EditSubjectModal
        open={Boolean(editingSubject)}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={async (id, data) => Boolean(await updateSubject(id, data))}
      />
    </div>
  );
};

export default SubjectsGrid;
