"use client";

import {
  Award,
  BookOpen,
  Download,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import type { CBTQuestionType } from "@/modules/questions/domain/dto/QuestionDTO";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
import Button from "@/shared-ui/component/Button";
import QuestionTypeBadge from "../atoms/QuestionTypeBadge";
import ImportQuestionsModal from "../molecules/ImportQuestionsModal";
import QuestionFilterBar from "../molecules/QuestionFilterBar";

export const QuestionsListGrid: FC = () => {
  const { questions, isLoading, error, fetchQuestions, deleteQuestion } =
    useQuestionsApi();

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [grade, setGrade] = useState("ALL");
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    fetchQuestions({
      subject: subject === "ALL" ? undefined : subject,
      gradeLevel: grade === "ALL" ? undefined : grade,
      type: type === "ALL" ? undefined : (type as CBTQuestionType),
      search: search.trim() || undefined,
    });
  }, [fetchQuestions, subject, grade, type, search]);

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus butir soal ${code}?`)) {
      await deleteQuestion(id);
    }
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
          <a
            href="/templates/sample_import_soal.csv"
            download="sample_import_soal.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Unduh Template
          </a>

          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            leftIcon={UploadCloud}
            onClick={() => setImportModalOpen(true)}
          >
            Import Soal (8 Jenis)
          </Button>

          <Link href="/dashboard/questions/new">
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={Plus}
            >
              Buat Soal Baru
            </Button>
          </Link>
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
            <div
              key={q.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#0d2b5c] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      {q.code}
                    </span>
                    <QuestionTypeBadge type={q.type} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg">
                    {q.subject} • Kelas {q.gradeLevel}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-3">
                  {q.stem}
                </div>

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
                <button
                  type="button"
                  onClick={() => handleDelete(q.id, q.code)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Soal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
    </div>
  );
};

export default QuestionsListGrid;
