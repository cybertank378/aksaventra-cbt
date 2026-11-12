"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  FileQuestion,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type FC, useState } from "react";
import { generateExcelCsv, parseTabularFile } from "@/libs/excelCsvUtils";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
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

const QUESTION_TYPE_GUIDES = [
  {
    type: "multichoice_single",
    name: "1. Pilihan Ganda Tunggal",
    optionsCol: "Isi opsi_a s/d opsi_e (minimal A - C)",
    exampleKey: "C",
    note: "Hanya satu jawaban bernilai benar.",
  },
  {
    type: "multichoice_multi",
    name: "2. PG Kompleks (MCMA)",
    optionsCol: "Isi opsi_a s/d opsi_e",
    exampleKey: "A,C,E",
    note: "Siswa dapat mencentang lebih dari satu pilihan jawaban.",
  },
  {
    type: "truefalse",
    name: "3. Benar / Salah",
    optionsCol: "opsi_a: 'Benar', opsi_b: 'Salah'",
    exampleKey: "TRUE",
    note: "Kunci: TRUE / FALSE atau Benar / Salah.",
  },
  {
    type: "shortanswer",
    name: "4. Isian Singkat",
    optionsCol: "Kosongkan opsi A s/d E",
    exampleKey: "Linux",
    note: "Kata / frasa jawaban singkat. Bisa variasi dipisah titik-koma.",
  },
  {
    type: "numerical",
    name: "5. Numerik & Toleransi",
    optionsCol: "Kosongkan opsi A s/d E",
    exampleKey: "100",
    note: "Isi toleransi_error untuk rentang nilai (misal 0.05).",
  },
  {
    type: "match",
    name: "6. Menjodohkan",
    optionsCol: "opsi_a s/d opsi_d diisi '1:Premis1', '2:Premis2'...",
    exampleKey: "1:Tokyo;2:Paris;3:London",
    note: "Pasangkan ID premis kiri dengan pasangan jawaban kanan.",
  },
  {
    type: "gapselect",
    name: "7. Teks Rumpang (Cloze)",
    optionsCol: "opsi_a s/d opsi_e diisi kata opsi & pengecoh",
    exampleKey: "1:Hypertext;2:Language",
    note: "Teks soal wajib menggunakan kode rumpang ganda [[1]], [[2]].",
  },
  {
    type: "essay",
    name: "8. Esai / Uraian",
    optionsCol: "Kosongkan opsi A s/d E",
    exampleKey: "requires_manual_grading",
    note: "Jawaban esai dinilai secara manual oleh Guru/Korektor.",
  },
];

export const ImportQuestionsModal: FC<ImportQuestionsModalProps> = ({
  open,
  onClose,
  onSuccess,
  examId = 1,
}) => {
  const { importQuestions, isLoading } = useQuestionsApi();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [previewQuestions, setPreviewQuestions] = useState<
    Record<string, string>[]
  >([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleReset = () => {
    setSelectedFile(null);
    setRawCsvText("");
    setPreviewQuestions([]);
    setTotalQuestions(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    try {
      const parsed = await parseTabularFile(file);
      const csvString = generateExcelCsv(parsed.headers, parsed.rawRows);
      setRawCsvText(csvString);
      setSelectedFile(file);
      setPreviewQuestions(parsed.rows.slice(0, 5));
      setTotalQuestions(parsed.totalRows);
    } catch {
      handleReset();
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

    const res = await importQuestions(rawCsvText, examId);
    if (res.success) {
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
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

        {/* Expandable Guide Accordion for 8 Question Types */}
        <div className="flex flex-col rounded-2xl border border-indigo-200/80 bg-indigo-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full px-4 py-2.5 bg-indigo-50/80 hover:bg-indigo-100/70 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  Panduan Format Pengisian 8 Tipe Soal Moodle CBT
                </p>
                <p className="text-[11px] text-indigo-700/80">
                  Berkas Excel memuat sheet terpisah untuk setiap tipe soal
                  (1_PILIHAN_GANDA s/d 8_ESAI_URAIAN)
                </p>
              </div>
            </div>
            {showGuide ? (
              <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
          </button>

          {showGuide && (
            <div className="p-4 bg-white border-t border-indigo-100 space-y-3 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-600">
                Gunakan lembar kerja (sheet) <strong>TEMPLATE_SOAL</strong>{" "}
                untuk mengimpor seluruh soal gabungan sekaligus, atau pelajari
                contoh format spesifik pada masing-masing lembar kerja berikut:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {QUESTION_TYPE_GUIDES.map((g) => (
                  <div
                    key={g.type}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {g.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-100 text-indigo-800">
                        {g.type}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p>
                        <strong className="text-slate-700">Kolom Opsi:</strong>{" "}
                        {g.optionsCol}
                      </p>
                      <p>
                        <strong className="text-slate-700">
                          Contoh Kunci:
                        </strong>{" "}
                        <code className="px-1.5 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-900">
                          {g.exampleKey}
                        </code>
                      </p>
                      <p className="text-[10px] text-slate-500 italic pt-0.5 border-t border-slate-200/60 mt-1">
                        {g.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>

          {selectedFile && (
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || isParsing}
              leftIcon={isLoading ? Loader2 : UploadCloud}
            >
              {isLoading
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
