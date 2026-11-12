"use client";

import {
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type FC, useState } from "react";
import { generateExcelCsv, parseTabularFile } from "@/libs/excelCsvUtils";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";

interface ImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  cbtId?: number;
}

export const ImportStudentsModal: FC<ImportStudentsModalProps> = ({
  open,
  onClose,
  onSuccess,
  cbtId = 1,
}) => {
  const { importStudents, isLoading } = useClassesApi();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleReset = () => {
    setSelectedFile(null);
    setRawCsvText("");
    setPreviewRows([]);
    setTotalRows(0);
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
      setPreviewRows(parsed.rows.slice(0, 5));
      setTotalRows(parsed.totalRows);
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

    const res = await importStudents(rawCsvText, cbtId);
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
      title="Import Data Siswa & Rombel (Excel / CSV)"
      subtitle="Unggah berkas data siswa masal untuk sinkronisasi otomatis ke Moodle"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Template Download Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-[#0097a7]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Gunakan Template Resmi CSV Excel
              </p>
              <p className="text-[11px] text-slate-500">
                Format:
                nis_username;nama_lengkap;password;kelas;ruang_ujian;nomor_meja;email
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/templates/sample_import_siswa.xlsx"
              download="sample_import_siswa.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </a>
            <a
              href="/templates/sample_import_siswa.xls"
              download="sample_import_siswa.xls"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (.xls)
            </a>
            <a
              href="/templates/sample_import_siswa.csv"
              download="sample_import_siswa.csv"
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
                ? "border-[#0097a7] bg-teal-50/50"
                : "border-slate-300 hover:border-[#0097a7]/60 bg-slate-50/40"
            }`}
          >
            <input
              id="student-file-upload"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="student-file-upload"
              className="flex flex-col items-center justify-center cursor-pointer w-full"
            >
              <div className="p-3.5 rounded-full bg-slate-100 text-slate-600 mb-3">
                <UploadCloud className="w-7 h-7 text-[#0097a7]" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Klik untuk memilih berkas atau seret ke sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Mendukung berkas Excel (.xlsx / .xls) dan CSV berpemisah
                titik-koma (;)
              </p>
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#0097a7]" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {totalRows} baris siswa terdeteksi
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

            {/* Preview Table */}
            {previewRows.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-slate-600">
                  Pratinjau Data (5 Baris Pertama):
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">NIS/User</th>
                        <th className="px-3 py-2">Nama Lengkap</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">Ruang</th>
                        <th className="px-3 py-2">Meja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewRows.map((r, i) => (
                        <tr key={`row-${r.nis_username || i}`}>
                          <td className="px-3 py-2 font-mono">
                            {r.nis_username || r.username || "-"}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {r.nama_lengkap || r.name || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {r.kelas || r.class || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {r.ruang_ujian || r.ruangan || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {r.nomor_meja || r.meja || "-"}
                          </td>
                        </tr>
                      ))}
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
                ? "Mengimpor ke Moodle..."
                : `Proses ${totalRows} Siswa`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportStudentsModal;
