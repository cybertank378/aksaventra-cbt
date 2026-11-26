"use client";

import {
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FC,
  useEffect,
  useState,
} from "react";
import { generateExcelCsv, parseTabularFile } from "@/libs/excelCsvUtils";
import type { ClassGroupDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import { useSubjectsApi } from "@/modules/subjects/presentation/useSubjectsApi";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface SimpleSubjectOption {
  id: string;
  name: string;
}

interface SimpleExamOption {
  id: string;
  title: string;
  courseName?: string;
}

interface ImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classes?: ClassGroupDTO[];
  cbtId?: number;
}

export const ImportStudentsModal: FC<ImportStudentsModalProps> = ({
  open,
  onClose,
  onSuccess,
  classes = [],
}) => {
  const { importStudents, isLoading } = useClassesApi();
  const { subjects: apiSubjects, fetchSubjects } = useSubjectsApi();
  const { examsList, fetchExamsList } = useExamManagementApi();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [defaultClassGroupId, setDefaultClassGroupId] = useState<string>("");
  const [targetSubjectId, setTargetSubjectId] = useState<string>("");
  const [targetExamId, setTargetExamId] = useState<string>("");

  const subjects: SimpleSubjectOption[] = apiSubjects.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const exams: SimpleExamOption[] = examsList.map((e) => ({
    id: String(e.examId || ""),
    title: e.title,
    courseName: e.courseName,
  }));

  useEffect(() => {
    if (!open) return;
    void fetchSubjects();
    void fetchExamsList();
  }, [open, fetchSubjects, fetchExamsList]);

  const handleReset = () => {
    setSelectedFile(null);
    setRawCsvText("");
    setPreviewRows([]);
    setTotalRows(0);
    setDefaultClassGroupId("");
    setTargetSubjectId("");
    setTargetExamId("");
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

  const handleProcessDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!rawCsvText) return;

    const selectedSubject = subjects.find((s) => s.id === targetSubjectId);
    const res = await importStudents(rawCsvText, {
      defaultClassGroupId: defaultClassGroupId || null,
      subjectId: targetSubjectId || null,
      courseName: selectedSubject?.name || null,
      examId: targetExamId || null,
    });
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
      title="Batch Upload Siswa, Cohort & Enrollment (Excel / CSV)"
      subtitle="Mendukung format Aksaventra & Moodle Upload Users CSV, otomatis tersimpan di Aksaventra CBT dan tersinkron ke Moodle"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Template Download Banner */}
        <Card
          variant="flat"
          className="p-4 rounded-2xl bg-slate-50 border-slate-200"
          bodyClassName="p-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0097a7]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Format Standar Moodle v5 Batch Upload Users
                </p>
                <p className="text-[11px] text-slate-500">
                  Moodle v5:{" "}
                  <code className="font-mono font-semibold text-slate-700">
                    username,firstname,lastname,email,password
                  </code>{" "}
                  (kolom <code className="font-mono">lastname</code> otomatis
                  dikelompokkan sebagai Kelas / Cohort)
                </p>
              </div>
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
                Excel (.xlsx)
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
                Excel (.xls)
              </Button>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                size="sm"
                leftIcon={Download}
                onClick={() =>
                  handleProcessDownload(
                    "/templates/sample_import_siswa.csv",
                    "sample_import_siswa.csv",
                  )
                }
              >
                CSV
              </Button>
            </div>
          </div>
        </Card>

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
            <Card
              variant="flat"
              className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200"
              bodyClassName="p-0"
            >
              <div className="flex items-center justify-between">
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

                <Button
                  type="button"
                  variant="ghost"
                  color="danger"
                  size="sm"
                  iconOnly
                  leftIcon={X}
                  onClick={handleReset}
                  aria-label="Hapus berkas terpilih"
                />
              </div>
            </Card>

            {/* Optional Cohort & Enrollment Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <SelectField
                label="Kelas / Cohort Default (Opsional)"
                value={defaultClassGroupId}
                onChange={(e) => setDefaultClassGroupId(e.target.value)}
                size="sm"
              >
                <option value="">Ikuti kolom kelas/cohort1 di berkas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Enroll ke Course / Mapel (Opsional)"
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                size="sm"
              >
                <option value="">Tidak perlu / ikut kolom course1</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Enroll ke Ujian / Quiz CBT (Opsional)"
                value={targetExamId}
                onChange={(e) => setTargetExamId(e.target.value)}
                size="sm"
              >
                <option value="">Belum ditetapkan ke ujian</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </SelectField>
            </div>

            {/* Preview Table */}
            {previewRows.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-slate-600">
                  Pratinjau Data (5 Baris Pertama):
                </p>
                <Table wrapperClassName="rounded-xl border border-slate-200 overflow-hidden">
                  <TableHead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <TableRow>
                      <TableHeaderCell className="px-3 py-2 text-xs">
                        NIS/User
                      </TableHeaderCell>
                      <TableHeaderCell className="px-3 py-2 text-xs">
                        Nama Lengkap
                      </TableHeaderCell>
                      <TableHeaderCell className="px-3 py-2 text-xs">
                        Kelas / Cohort
                      </TableHeaderCell>
                      <TableHeaderCell className="px-3 py-2 text-xs">
                        Course
                      </TableHeaderCell>
                      <TableHeaderCell className="px-3 py-2 text-xs">
                        Ruang
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-100 text-slate-700">
                    {previewRows.map((r, i) => (
                      <TableRow
                        key={`row-${r.nis_username || r.username || i}`}
                      >
                        <TableCell className="px-3 py-2 text-xs font-mono">
                          {r.nis_username || r.username || r.nis || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium">
                          {r.nama_lengkap ||
                            r.name ||
                            `${r.firstname || ""} ${r.lastname || ""}`.trim() ||
                            "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs">
                          {r.cohort ||
                            r.cohort1 ||
                            r.kelas ||
                            r.class ||
                            r.lastname ||
                            "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs">
                          {r.course1 || r.course || r.mata_pelajaran || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs">
                          {r.room_code ||
                            r.ruang_ujian ||
                            r.ruangan ||
                            "LAB-01"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
