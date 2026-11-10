"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileQuestion,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type FC, useState } from "react";
import { generateExcelCsv, parseTabularFile } from "@/libs/excelCsvUtils";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";

interface ImportQuestionsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  examId?: string | number;
}

const QUESTION_TYPE_NAMES: Record<string, string> = {
  multichoice_single: "Pilihan Ganda Tunggal",
  multichoice_multi: "Pilihan Ganda Kompleks (MCMA)",
  truefalse: "Benar / Salah",
  shortanswer: "Isian Singkat",
  numerical: "Numerik & Toleransi",
  match: "Menjodohkan",
  gapselect: "Teks Rumpang ([[1]], [[2]])",
  essay: "Esai / Uraian Manual",
};

export const ImportQuestionsModal: FC<ImportQuestionsModalProps> = ({
  open,
  onClose,
  onSuccess,
  examId = 1,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [previewQuestions, setPreviewQuestions] = useState<
    Record<string, string>[]
  >([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    importedCount: number;
    errors: string[];
  } | null>(null);

  const handleReset = () => {
    setSelectedFile(null);
    setRawCsvText("");
    setPreviewQuestions([]);
    setTotalQuestions(0);
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setResult(null);
    try {
      const parsed = await parseTabularFile(file);
      const csvString = generateExcelCsv(parsed.headers, parsed.rawRows);
      setRawCsvText(csvString);
      setSelectedFile(file);
      setPreviewQuestions(parsed.rows.slice(0, 5));
      setTotalQuestions(parsed.totalRows);
    } catch {
      setResult({
        success: false,
        message:
          "Gagal memproses berkas naskah soal. Pastikan format Excel (.xlsx, .xls) atau CSV valid.",
        importedCount: 0,
        errors: ["Berkas tidak dapat dibaca."],
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!rawCsvText) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const numericCbtId = Number(examId) || 1;
      const res = await fetch("/api/moodle-proxy/mod_cbt_import_export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_questions",
          cbtid: numericCbtId,
          payload: rawCsvText,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message:
            data.message ||
            `Berhasil mengimpor ${data.processed_count} butir soal.`,
          importedCount: data.processed_count || 0,
          errors: data.errors || [],
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setResult({
          success: false,
          message: data.message || data.error || "Gagal mengimpor butir soal.",
          importedCount: 0,
          errors: data.errors || [
            data.error || "Format kolom naskah soal tidak sesuai.",
          ],
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Gagal terhubung ke Moodle Headless Bridge.",
        importedCount: 0,
        errors: ["Koneksi jaringan terputus."],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Naskah Soal Masal (8 Jenis Soal Moodle)"
      subtitle="Mendukung Pilihan Ganda, MCMA, Benar/Salah, Isian Singkat, Numerik, Menjodohkan, Teks Rumpang, dan Esai"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Template Download Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Unduh Template Soal Lengkap 8 Varian
              </p>
              <p className="text-[11px] text-slate-500">
                Memuat contoh nyata untuk semua tipe soal, bobot, dan kunci
                jawaban
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/templates/sample_import_soal.xlsx"
              download="sample_import_soal.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </a>
            <a
              href="/templates/sample_import_soal.xls"
              download="sample_import_soal.xls"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (.xls)
            </a>
            <a
              href="/templates/sample_import_soal.csv"
              download="sample_import_soal.csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </a>
          </div>
        </div>

        {/* Upload Drop Zone */}
        {!selectedFile ? (
          // biome-ignore lint/a11y/noStaticElementInteractions: Drag and drop container wrapping hidden file input
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-300 hover:border-indigo-400 bg-slate-50/40"
            }`}
          >
            <input
              id="question-file-upload"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="question-file-upload"
              className="flex flex-col items-center justify-center cursor-pointer w-full"
            >
              <div className="p-3.5 rounded-full bg-slate-100 text-slate-600 mb-3">
                <UploadCloud className="w-7 h-7 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Pilih atau seret berkas naskah soal (.xlsx, .xls, .csv)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Mendukung Microsoft Excel (.xlsx / .xls) dan CSV berpemisah
                titik-koma (;)
              </p>
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <div className="flex items-center gap-2.5">
                <FileQuestion className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {totalQuestions} butir soal teridentifikasi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Questions */}
            {previewQuestions.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-slate-600">
                  Pratinjau Soal (5 Butir Pertama):
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Tipe Soal</th>
                        <th className="px-3 py-2">Teks Narasi Soal</th>
                        <th className="px-3 py-2">Bobot</th>
                        <th className="px-3 py-2">Kunci / Jawaban</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewQuestions.map((q, i) => {
                        const rawType = (
                          q.jenis_soal ||
                          q.type ||
                          ""
                        ).toLowerCase();
                        const typeLabel =
                          QUESTION_TYPE_NAMES[rawType] || rawType || "PG";

                        return (
                          <tr key={`q-${i}`}>
                            <td className="px-3 py-2 font-mono font-bold text-slate-800">
                              {q.nomor || i + 1}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                {typeLabel}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2 max-w-xs truncate"
                              title={q.teks_soal || q.question || ""}
                            >
                              {q.teks_soal || q.question || "-"}
                            </td>
                            <td className="px-3 py-2 font-mono">
                              {q.bobot || q.weight || "1.00"}
                            </td>
                            <td className="px-3 py-2 font-mono text-emerald-700 font-semibold">
                              {q.kunci_jawaban || q.key || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result & Feedback Banner */}
        {result && (
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              result.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <p className="text-xs font-bold">{result.message}</p>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-1 pl-6">
                <p className="text-[11px] font-semibold text-rose-700 mb-1">
                  Catatan Kesalahan Validasi:
                </p>
                <ul className="list-disc pl-4 text-[11px] text-rose-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {result.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {result?.success ? "Selesai" : "Batal"}
          </Button>

          {selectedFile && !result?.success && (
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isParsing}
              leftIcon={isSubmitting ? Loader2 : UploadCloud}
            >
              {isSubmitting
                ? "Memproses Naskah..."
                : `Simpan ${totalQuestions} Butir Soal`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportQuestionsModal;
