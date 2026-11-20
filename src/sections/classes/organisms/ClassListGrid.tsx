"use client";

import {
  Building2,
  Download,
  Edit3,
  Eye,
  FileDown,
  FileUp,
  GraduationCap,
  LayoutGrid,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type { ClassGroupDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import { showSuccessToast } from "@/shared-ui/component/Toast";
import ClassBadge from "../atoms/ClassBadge";
import CreateClassModal from "../molecules/CreateClassModal";
import EditClassModal from "../molecules/EditClassModal";
import ImportClassesModal from "../molecules/ImportClassesModal";
import ViewClassModal from "../molecules/ViewClassModal";
import ExamRoomSeatLayoutManager from "./ExamRoomSeatLayoutManager";

const SAMPLE_CLASSES_CSV = `username,firstname,lastname,email,password
ngaji92627001,A SIFA CHECILIA EKA PUTRI,IX-1,ngaji92627001@smpn29jkt.sch.id,Student123!
ngaji92627002,ACHMAD HADI RUSMANA,IX-1,ngaji92627002@smpn29jkt.sch.id,Student123!
ngaji82627037,ABID AQILA PRANAJA,VII-2,ngaji82627037@smpn29jkt.sch.id,Student123!
ngaji82627038,ABIDZAR NAILUN NABHAN,VII-2,ngaji82627038@smpn29jkt.sch.id,Student123!
ngaji82627072,ABIDZHAR ADWA FIRDAUS,VII-3,ngaji82627072@smpn29jkt.sch.id,Student123!`;

function triggerCsvDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const ClassListGrid: FC = () => {
  const {
    classes,
    students,
    isLoading,
    error,
    fetchClasses,
    fetchStudents,
    fetchClassDetails,
    createClass,
    updateClass,
    deleteClass,
    importClasses,
    exportClassesCsv,
    bulkAssignRoomAndSeats,
  } = useClassesApi();
  const [activeTab, setActiveTab] = useState<"CLASSES" | "ROOMS_SEATS">(
    "CLASSES",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassGroupDTO | null>(null);
  const [editingClass, setEditingClass] = useState<ClassGroupDTO | null>(null);

  useEffect(() => {
    void fetchClasses();
    void fetchStudents();
    const handleSynced = () => {
      void fetchClasses();
      void fetchStudents();
    };
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchClasses, fetchStudents]);

  const handleDownloadSample = () => {
    triggerCsvDownload("sample_import_kelas.csv", SAMPLE_CLASSES_CSV);
  };

  const handleExportCsv = async () => {
    const csvData = await exportClassesCsv();
    if (csvData) {
      triggerCsvDownload("data_rombel_kelas.csv", csvData);
      showSuccessToast("Data kelas berhasil diekspor ke CSV");
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Rombongan Belajar (Kelas / Cohort)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola rombel siswa untuk mempermudah penugasan jadwal ujian massal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 mr-1">
            <button
              type="button"
              onClick={() => setActiveTab("CLASSES")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "CLASSES"
                  ? "bg-[#0d2b5c] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Rombel Kelas ({classes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ROOMS_SEATS")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "ROOMS_SEATS"
                  ? "bg-[#0097a7] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Ruang &amp; Tata Letak Meja
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={handleDownloadSample}
            title="Unduh contoh format CSV Moodle v5 (username,firstname,lastname,email,password)"
          >
            Contoh CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={FileUp}
            onClick={() => setImportModalOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={FileDown}
            onClick={() => void handleExportCsv()}
            disabled={isLoading}
          >
            Export CSV
          </Button>
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Tambah Kelas Baru
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {activeTab === "ROOMS_SEATS" ? (
        <ExamRoomSeatLayoutManager
          classes={classes}
          students={students}
          isLoading={isLoading}
          onAssignRoomAndSeats={bulkAssignRoomAndSeats}
        />
      ) : isLoading && classes.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      ) : classes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 text-slate-400">
          <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Belum ada rombel kelas terdaftar.
          </p>
          <p className="text-xs mt-1">
            Klik tombol &quot;Tambah Kelas Baru&quot; atau &quot;Import
            CSV&quot; untuk membuat kelompok belajar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#0097a7]/50 transition-all"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <ClassBadge name={cls.name} />
                  <div className="flex items-center gap-1.5">
                    {cls.moodleId && (
                      <Badge color="teal" size="sm" variant="soft">
                        Cohort #{cls.moodleId}
                      </Badge>
                    )}
                    {cls.code && (
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {cls.code}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {cls.description || "Tidak ada keterangan khusus."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold whitespace-nowrap">
                  <Users className="w-4 h-4 text-[#0097a7] shrink-0" />
                  <span>{cls.studentCount || 0} Siswa</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    size="sm"
                    onClick={() => setViewingClass(cls)}
                    leftIcon={Eye}
                    title="Lihat Anggota Kelas"
                  >
                    Lihat
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    color="primary"
                    size="sm"
                    onClick={() => setEditingClass(cls)}
                    leftIcon={Edit3}
                    title="Edit Kelas"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    color="error"
                    size="sm"
                    iconOnly
                    onClick={() => {
                      if (confirm(`Hapus kelas "${cls.name}"?`)) {
                        void deleteClass(cls.id);
                      }
                    }}
                    leftIcon={Trash2}
                    title="Hapus Kelas"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        students={students}
        onSubmit={async (data) => {
          const ok = await createClass(data);
          if (ok && data.studentIds && data.studentIds.length > 0) {
            await fetchStudents();
          }
          return ok;
        }}
      />

      {/* Import Classes CSV Modal */}
      <ImportClassesModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={importClasses}
        onDownloadSample={handleDownloadSample}
      />

      {/* View Class Members Modal */}
      <ViewClassModal
        open={Boolean(viewingClass)}
        classGroup={viewingClass}
        onClose={() => setViewingClass(null)}
        onLoadDetails={fetchClassDetails}
        onEdit={(cls) => setEditingClass(cls)}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        open={Boolean(editingClass)}
        classGroup={editingClass}
        students={students}
        onClose={() => setEditingClass(null)}
        onSave={async (id, data) => {
          const updated = await updateClass(id, data);
          if (updated) {
            await fetchStudents();
            return true;
          }
          return false;
        }}
      />
    </div>
  );
};

export default ClassListGrid;
