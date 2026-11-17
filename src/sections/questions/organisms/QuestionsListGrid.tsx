"use client";

import {
  Award,
  BookOpen,
  Download,
  Edit3,
  Eye,
  FolderKanban,
  HelpCircle,
  Image as ImageIcon,
  LineChart,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type {
  CBTQuestionType,
  CreateQuestionInputDTO,
  QuestionDTO,
} from "@/modules/questions/domain/dto/QuestionDTO";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import MathRenderer from "@/shared-ui/component/MathRenderer";
import SelectField from "@/shared-ui/component/SelectField";
import QuestionTypeBadge from "../atoms/QuestionTypeBadge";
import EditQuestionModal from "../molecules/EditQuestionModal";
import ImportQuestionsModal from "../molecules/ImportQuestionsModal";
import QuestionEditorHelpModal from "../molecules/QuestionEditorHelpModal";
import QuestionFilterBar from "../molecules/QuestionFilterBar";
import ViewQuestionModal from "../molecules/ViewQuestionModal";

export const QuestionsListGrid: FC = () => {
  const router = useRouter();
  const {
    questions,
    subjects,
    isLoading,
    error,
    fetchQuestions,
    fetchSubjects,
    updateQuestion,
    deleteQuestion,
    bulkGroupQuestions,
  } = useQuestionsApi();

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [grade, setGrade] = useState("ALL");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<QuestionDTO | null>(
    null,
  );
  const [editingQuestion, setEditingQuestion] = useState<QuestionDTO | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkGrade, setBulkGrade] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    const load = () =>
      fetchQuestions({
        subject: subject === "ALL" ? undefined : subject,
        gradeLevel: grade === "ALL" ? undefined : grade,
        type: type === "ALL" ? undefined : (type as CBTQuestionType),
        search: search.trim() || undefined,
      });
    load();
    window.addEventListener("aksaventra:synced", load);
    return () => window.removeEventListener("aksaventra:synced", load);
  }, [fetchQuestions, subject, grade, type, search]);

  const toggleSelectQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkGroup = async () => {
    if (selectedIds.length === 0 || (!bulkGrade && !bulkSubject)) return;
    const ok = await bulkGroupQuestions(selectedIds, {
      ...(bulkGrade ? { gradeLevel: bulkGrade } : {}),
      ...(bulkSubject ? { subject: bulkSubject } : {}),
    });
    if (ok) {
      setSelectedIds([]);
      setBulkGrade("");
      setBulkSubject("");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus butir soal ${code}?`)) {
      await deleteQuestion(id);
    }
  };

  const handleView = (q: QuestionDTO) => {
    setViewingQuestion(q);
  };

  const handleEdit = (q: QuestionDTO) => {
    setEditingQuestion(q);
  };

  const handleSaveEdit = async (
    id: string,
    data: Partial<CreateQuestionInputDTO>,
  ): Promise<boolean> => {
    const updated = await updateQuestion(id, data);
    return Boolean(updated);
  };

  const handleProcessDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateQuestion = () => {
    router.replace("/dashboard/questions/new");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Katalog Bank Soal Terpusat
          </h2>
          <p className="text-xs text-slate-500">
            Kumpulan bank butir soal ujian dengan dukungan 8 tipe pertanyaan CBT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_soal.xlsx",
                "sample_import_soal.xlsx",
              )
            }
            title="Unduh Template Format Excel (.xlsx)"
          >
            Template Excel (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_soal.xls",
                "sample_import_soal.xls",
              )
            }
            title="Unduh Template Format Excel (.xls)"
          >
            .xls
          </Button>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={HelpCircle}
            onClick={() => setHelpModalOpen(true)}
            title="Bantuan Penulisan KaTeX & Impor Soal Word"
          >
            Bantuan Editor & Word
          </Button>

          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            leftIcon={UploadCloud}
            onClick={() => setImportModalOpen(true)}
          >
            Import Soal (Word & Excel)
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleCreateQuestion}
          >
            Buat Soal Baru
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <QuestionFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedSubject={subject}
        onSubjectChange={setSubject}
        selectedType={type}
        onTypeChange={setType}
        selectedGrade={grade}
        onGradeChange={setGrade}
      />

      {/* Bulk Grade / Subject Grouping Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-teal-50/90 border border-teal-200">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0d2b5c]">
            <FolderKanban className="w-4 h-4 text-[#0097a7]" />
            <span>{selectedIds.length} soal dipilih untuk pengelompokan</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              value={bulkSubject}
              onChange={(e) => setBulkSubject(e.target.value)}
              size="sm"
            >
              <option value="">-- Ubah Mapel (Opsional) --</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </SelectField>
            <SelectField
              value={bulkGrade}
              onChange={(e) => setBulkGrade(e.target.value)}
              size="sm"
            >
              <option value="">-- Ubah Kelas (Opsional) --</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
              <option value="VII">Kelas VII</option>
              <option value="VIII">Kelas VIII</option>
              <option value="IX">Kelas IX</option>
            </SelectField>
            <Button
              type="button"
              variant="filled"
              color="teal"
              size="sm"
              onClick={handleBulkGroup}
              disabled={!bulkGrade && !bulkSubject}
              loading={isLoading}
            >
              Terapkan Kelompok
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
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Tidak ada butir soal yang sesuai kriteria filter
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol &quot;Buat Soal Baru&quot; untuk menambahkan soal ke
            bank soal
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <Card
              key={q.id}
              className="flex flex-col justify-between p-5 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelectQuestion(q.id)}
                      aria-label={`Pilih soal ${q.code}`}
                      className="h-4 w-4 rounded border-slate-300 text-[#0097a7]"
                    />
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelectQuestion(q.id)}
                      aria-label={`Pilih soal ${q.code}`}
                      className="h-4 w-4 rounded border-slate-300 text-[#0097a7]"
                    />
                    <Badge
                      color="neutral"
                      size="sm"
                      className="font-mono font-extrabold text-[#0d2b5c]"
                    >
                      {q.code}
                    </Badge>
                    <QuestionTypeBadge type={q.type} />
                    {(q.imageUrl ||
                      q.stem.includes("<svg") ||
                      q.stem.includes("<img")) && (
                      <Badge
                        color="teal"
                        size="sm"
                        className="flex items-center gap-1 font-bold"
                      >
                        <ImageIcon className="w-3 h-3 text-[#0097a7]" />
                        Diagram / Kurva
                      </Badge>
                    )}
                  </div>
                  <Badge color="neutral" size="sm" className="text-slate-500">
                    {q.subject} • Kelas {q.gradeLevel}
                  </Badge>
                </div>

                {q.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-32 flex items-center justify-center p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt={`Diagram soal ${q.code}`}
                      className="max-h-28 object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                )}

                <MathRenderer
                  content={q.stem}
                  className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-3"
                />

                {q.options && q.options.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>{q.options.length} Opsi Pilihan</span>
                    <span className="font-bold text-[#0097a7] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {q.points} Poin
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  leftIcon={Eye}
                  onClick={() => handleView(q)}
                  title="Lihat Detail Butir Soal"
                >
                  Lihat
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="primary"
                  size="sm"
                  leftIcon={Edit3}
                  onClick={() => handleEdit(q)}
                  title="Edit Butir Soal"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  color="error"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={() => handleDelete(q.id, q.code)}
                  title="Hapus Soal"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Question Detail Modal */}
      <ViewQuestionModal
        open={Boolean(viewingQuestion)}
        question={viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        onEdit={(q) => {
          setViewingQuestion(null);
          setEditingQuestion(q);
        }}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        open={Boolean(editingQuestion)}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveEdit}
      />

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchQuestions({
            subject: subject === "ALL" ? undefined : subject,
            gradeLevel: grade === "ALL" ? undefined : grade,
            type: type === "ALL" ? undefined : (type as CBTQuestionType),
            search: search.trim() || undefined,
          });
        }}
      />

      {/* Editor & Word Help Modal */}
      <QuestionEditorHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
};

export default QuestionsListGrid;
