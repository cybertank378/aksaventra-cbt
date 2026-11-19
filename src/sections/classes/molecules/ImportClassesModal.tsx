"use client";

import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { type FC, useRef, useState } from "react";
import type { BatchImportClassesResultDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";

export interface ImportClassesModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (
    csvText: string,
  ) => Promise<
    BatchImportClassesResultDTO & { success: boolean; message: string }
  >;
  onDownloadSample: () => void;
}

const SAMPLE_CSV_PREVIEW = `fullname,lastname
A SIFA CHECILIA EKA PUTRI,IX-1
AHMAD DAHLAN,IX-1
BUDI SANTOSO,IX-2
CITRA LESTARI,IX-2
DEWI SARTIKA,IX-3`;

export const ImportClassesModal: FC<ImportClassesModalProps> = ({
  open,
  onClose,
  onImport,
  onDownloadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<
    (BatchImportClassesResultDTO & { success: boolean; message: string }) | null
  >(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCsvText(text);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await onImport(csvText);
      setResult(res);
      if (res.success && (!res.errors || res.errors.length === 0)) {
        setCsvText("");
        setFileName(null);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title="Import Data Rombel / Kelas (CSV)"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Format CSV Rombongan Belajar (Kelas)
              </p>
              <p className="text-[11px] text-slate-500">
                Gunakan header{" "}
                <code className="font-mono font-semibold text-slate-700">
                  fullname,lastname
                </code>{" "}
                di mana kolom <code className="font-mono">lastname</code>{" "}
                digunakan untuk memfilter dan mengelompokkan siswa ke dalam
                rombel kelas secara otomatis.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={Download}
              onClick={onDownloadSample}
            >
              Unduh Contoh CSV
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-300">
            {SAMPLE_CSV_PREVIEW}
          </pre>
        </div>

        {/* File Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0097a7]/10 text-[#0097a7]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {fileName || "Pilih berkas CSV dari komputer Anda"}
              </p>
              <p className="text-[11px] text-slate-500">
                Mendukung berkas .csv atau tempel langsung isi CSV di bawah
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            leftIcon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Pilih Berkas CSV
          </Button>
        </div>

        <div>
          <label
            htmlFor="classes-csv-textarea"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Konten CSV Kelas
          </label>
          <textarea
            id="classes-csv-textarea"
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={SAMPLE_CSV_PREVIEW}
            className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 placeholder:text-slate-300 focus:border-[#0097a7] focus:outline-none"
          />
        </div>

        {result && (
          <div
            className={`rounded-2xl border p-3.5 text-xs ${
              result.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <p className="font-bold">{result.message}</p>
            {result.errors && result.errors.length > 0 && (
              <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px]">
                {result.errors.slice(0, 5).map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Tutup
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="sm"
            loading={isSubmitting}
            disabled={!csvText.trim()}
          >
            Proses Import Kelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ImportClassesModal;
