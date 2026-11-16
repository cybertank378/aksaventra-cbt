"use client";

import { Edit3, Eye, GraduationCap, Plus, Trash2, Users } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type { ClassGroupDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import Button from "@/shared-ui/component/Button";
import ClassBadge from "../atoms/ClassBadge";
import CreateClassModal from "../molecules/CreateClassModal";
import EditClassModal from "../molecules/EditClassModal";
import ViewClassModal from "../molecules/ViewClassModal";

export const ClassListGrid: FC = () => {
  const {
    classes,
    isLoading,
    error,
    fetchClasses,
    fetchClassDetails,
    createClass,
    updateClass,
    deleteClass,
  } = useClassesApi();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassGroupDTO | null>(null);
  const [editingClass, setEditingClass] = useState<ClassGroupDTO | null>(null);

  useEffect(() => {
    fetchClasses();
    const handleSynced = () => fetchClasses();
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => window.removeEventListener("aksaventra:synced", handleSynced);
  }, [fetchClasses]);

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

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Grid of Classes */}
      {isLoading && classes.length === 0 ? (
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
            Klik tombol &quot;Tambah Kelas Baru&quot; untuk membuat kelompok
            belajar.
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <ClassBadge name={cls.name} />
                  {cls.code && (
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {cls.code}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {cls.description || "Tidak ada keterangan khusus."}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-[#0097a7]" />
                  <span>{cls.studentCount || 0} Siswa</span>
                </div>

                <div className="flex items-center gap-1">
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
                    onClick={() => {
                      if (confirm(`Hapus kelas "${cls.name}"?`)) {
                        deleteClass(cls.id);
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
        onSubmit={createClass}
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
        onClose={() => setEditingClass(null)}
        onSave={async (id, data) => Boolean(await updateClass(id, data))}
      />
    </div>
  );
};

export default ClassListGrid;
