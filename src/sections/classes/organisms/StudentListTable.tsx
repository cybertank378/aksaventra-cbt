"use client";

import {
  Download,
  Edit3,
  Eye,
  FolderKanban,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  UserCheck,
  UserX,
} from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { downloadCsvBlob, generateExcelCsv } from "@/libs/excelCsvUtils";
import type { StudentDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import { useSubjectsApi } from "@/modules/subjects/presentation/useSubjectsApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import SelectField from "@/shared-ui/component/SelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";
import ClassBadge from "../atoms/ClassBadge";
import CreateStudentModal from "../molecules/CreateStudentModal";
import EditStudentModal from "../molecules/EditStudentModal";
import ImportStudentsModal from "../molecules/ImportStudentsModal";
import ViewStudentModal from "../molecules/ViewStudentModal";

export const StudentListTable: FC = () => {
  const {
    classes,
    students,
    isLoading,
    error,
    fetchClasses,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkAssignStudentsClass,
    enrollStudents,
    exportStudents,
  } = useClassesApi();

  const { subjects: apiSubjects, fetchSubjects } = useSubjectsApi();
  const { examsList, fetchExamsList } = useExamManagementApi();

  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentDTO | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentDTO | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTargetClassId, setBulkTargetClassId] = useState<string>("");
  const [enrollSubjectId, setEnrollSubjectId] = useState<string>("");
  const [enrollExamId, setEnrollExamId] = useState<string>("");

  const subjects = useMemo(
    () => apiSubjects.map((s) => ({ id: s.id, name: s.name })),
    [apiSubjects],
  );
  const exams = useMemo(
    () =>
      examsList.map((e) => ({ id: String(e.examId || ""), title: e.title })),
    [examsList],
  );

  useEffect(() => {
    void fetchClasses();
    void fetchStudents();
    void fetchSubjects();
    void fetchExamsList();

    const handleSynced = () => {
      void fetchClasses();
      void fetchStudents();
      void fetchSubjects();
      void fetchExamsList();
    };
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchClasses, fetchStudents, fetchSubjects, fetchExamsList]);

  const handleProcessDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStudents = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportStudents();
      if (csvData) {
        downloadCsvBlob(csvData, "daftar_siswa_moodle.csv");
        setIsExporting(false);
        return;
      }
    } catch {
      // Fallback to local students export
    }

    // 2. Client fallback from loaded students (Moodle v5 format: username,firstname,lastname,email,password)
    const headers = ["username", "firstname", "lastname", "email", "password"];
    const rows = filteredStudents.map((s) => {
      const className =
        classes.find((c) => c.id === s.classGroupId)?.name || s.className || "";
      const trimmed = s.fullName.trim();
      const suffix = className ? ` ${className}` : "";
      const firstname =
        suffix &&
        trimmed.toLowerCase().endsWith(suffix.toLowerCase()) &&
        trimmed.length > suffix.length
          ? trimmed.slice(0, trimmed.length - suffix.length).trim()
          : trimmed;
      return [
        s.username,
        firstname,
        className || "-",
        `${s.username}@smpn29jkt.sch.id`,
        "Student123!",
      ];
    });
    const csvContent = generateExcelCsv(headers, rows);
    downloadCsvBlob(csvContent, "daftar_siswa_moodle_v5.csv");
    setIsExporting(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(query);
        const matchNIS = s.username.toLowerCase().includes(query);
        if (!matchName && !matchNIS) return false;
      }
      if (selectedClassFilter === "UNASSIGNED") {
        return !s.classGroupId;
      }
      if (selectedClassFilter !== "ALL") {
        return s.classGroupId === selectedClassFilter;
      }
      return true;
    });
  }, [students, search, selectedClassFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedClassFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(
    () =>
      filteredStudents.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage,
      ),
    [filteredStudents, safeCurrentPage, itemsPerPage],
  );

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([
        ...selectedIds,
        ...filteredStudents.map((s) => s.id),
      ]);
      setSelectedIds(Array.from(merged));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkAssignClass = async () => {
    if (selectedIds.length === 0) return;
    const ok = await bulkAssignStudentsClass({
      studentIds: selectedIds,
      classGroupId: bulkTargetClassId || null,
    });
    if (ok) {
      setSelectedIds([]);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedIds.length === 0) return;
    if (!enrollSubjectId && !enrollExamId) return;
    const selectedSubject = subjects.find((s) => s.id === enrollSubjectId);
    const res = await enrollStudents({
      studentIds: selectedIds,
      subjectId: enrollSubjectId || null,
      courseName: selectedSubject?.name || null,
      examId: enrollExamId || null,
    });
    if (res) {
      setSelectedIds([]);
      setEnrollSubjectId("");
      setEnrollExamId("");
    }
  };

  const handleDeleteStudent = async (s: StudentDTO) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus siswa "${s.fullName}" (${s.username})?`,
      )
    ) {
      const ok = await deleteStudent(s.id);
      if (ok) {
        setSelectedIds((prev) => prev.filter((id) => id !== s.id));
        fetchClasses();
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Akun Peserta Didik (Siswa)
          </h2>
          <p className="text-xs text-slate-500">
            Data login peserta ujian CBT, nomor induk, dan penempatan rombel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            color="success"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_siswa.xlsx",
                "sample_import_siswa.xlsx",
              )
            }
          >
            Template (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            color="teal"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_siswa.xls",
                "sample_import_siswa.xls",
              )
            }
          >
            .xls
          </Button>

          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            leftIcon={UploadCloud}
            onClick={() => setImportModalOpen(true)}
          >
            Batch Upload Siswa
          </Button>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={handleExportStudents}
            disabled={isExporting}
          >
            {isExporting ? "Mengekspor..." : "Export Siswa (Excel)"}
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Daftarkan Siswa
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex-1 max-w-md">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa berdasarkan nama atau NIS..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <SelectField
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            size="sm"
          >
            <option value="ALL">Semua Rombel / Kelas</option>
            <option value="UNASSIGNED">Belum Punya Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* Bulk Class Grouping & Course/Exam Enrollment Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 px-4 py-3 rounded-2xl bg-teal-50/90 border border-teal-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0d2b5c]">
              <FolderKanban className="w-4 h-4 text-[#0097a7]" />
              <span>
                {selectedIds.length} siswa dipilih (Pengelompokan Cohort &amp;
                Enrollment Course/Ujian)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SelectField
                value={bulkTargetClassId}
                onChange={(e) => setBulkTargetClassId(e.target.value)}
                size="sm"
              >
                <option value="">
                  -- Lepas dari Kelas (Belum ditentukan) --
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
              <Button
                type="button"
                variant="filled"
                color="teal"
                size="sm"
                onClick={handleBulkAssignClass}
                loading={isLoading}
              >
                Terapkan Kelas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Batal
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-teal-200/70">
            <SelectField
              value={enrollSubjectId}
              onChange={(e) => setEnrollSubjectId(e.target.value)}
              size="sm"
            >
              <option value="">-- Pilih Mata Pelajaran (Course) --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              value={enrollExamId}
              onChange={(e) => setEnrollExamId(e.target.value)}
              size="sm"
            >
              <option value="">-- Pilih Ujian / Quiz CBT --</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </SelectField>
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              onClick={handleBulkEnroll}
              disabled={!enrollSubjectId && !enrollExamId}
              loading={isLoading}
            >
              Enroll ke Course / Ujian
            </Button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <Table wrapperClassName="rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <TableHead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
          <TableRow>
            <TableHeaderCell className="px-4 py-3.5 w-10">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                aria-label="Pilih semua siswa"
                className="h-4 w-4 rounded border-slate-300 text-[#0097a7]"
              />
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5">
              Nama Siswa
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5">
              NIS / Username
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5">
              Kelas / Rombel
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5">
              Ruang Default
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5">
              Status Akun
            </TableHeaderCell>
            <TableHeaderCell className="px-5 py-3.5 text-right">
              Aksi
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-slate-100">
          {isLoading && students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="px-5 py-12 text-center">
                <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
              </TableCell>
            </TableRow>
          ) : filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-5 py-8 text-center text-slate-400"
              >
                Tidak ada siswa yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            paginatedStudents.map((s) => (
              <TableRow
                key={s.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <TableCell className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSelectOne(s.id)}
                    aria-label={`Pilih siswa ${s.fullName}`}
                    className="h-4 w-4 rounded border-slate-300 text-[#0097a7]"
                  />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[#0d2b5c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {s.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900">
                      {s.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5 font-mono text-slate-700 font-medium">
                  {s.username}
                </TableCell>
                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                  {s.className ? (
                    <ClassBadge name={s.className} size="sm" />
                  ) : (
                    <span className="text-slate-400 italic">
                      Belum ditentukan
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-semibold">
                  {s.roomCode || "-"}
                </TableCell>
                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                  {s.isActive ? (
                    <Badge color="success" variant="soft" size="sm">
                      <UserCheck className="w-3.5 h-3.5 mr-1 inline" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge color="error" variant="soft" size="sm">
                      <UserX className="w-3.5 h-3.5 mr-1 inline" />
                      Nonaktif
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      color="secondary"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => setViewingStudent(s)}
                      title="Lihat Detail Siswa"
                    >
                      Lihat
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      color="primary"
                      size="sm"
                      leftIcon={Edit3}
                      onClick={() => setEditingStudent(s)}
                      title="Edit Siswa & Rombel"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      color="error"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => handleDeleteStudent(s)}
                      title="Hapus Siswa"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {filteredStudents.length > 0 && (
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
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </SelectField>
          </div>
          <div className="flex-1 w-full">
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filteredStudents.length}
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
      )}

      {/* Create Student Modal */}
      <CreateStudentModal
        open={modalOpen}
        classes={classes}
        onClose={() => setModalOpen(false)}
        onSubmit={createStudent}
      />

      {/* View Student Modal */}
      <ViewStudentModal
        open={Boolean(viewingStudent)}
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(s) => setEditingStudent(s)}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        open={Boolean(editingStudent)}
        student={editingStudent}
        classes={classes}
        onClose={() => setEditingStudent(null)}
        onSave={async (id, data) => {
          const updated = await updateStudent(id, data);
          if (updated) {
            fetchClasses();
          }
          return Boolean(updated);
        }}
      />

      {/* Import Students Modal */}
      <ImportStudentsModal
        open={importModalOpen}
        classes={classes}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
          fetchClasses();
        }}
      />
    </div>
  );
};

export default StudentListTable;
