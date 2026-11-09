"use client";

import { Plus, Search, UserCheck } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import Button from "@/shared-ui/component/Button";
import ClassBadge from "../atoms/ClassBadge";
import CreateStudentModal from "../molecules/CreateStudentModal";

export const StudentListTable: FC = () => {
  const {
    classes,
    students,
    isLoading,
    error,
    fetchClasses,
    fetchStudents,
    createStudent,
  } = useClassesApi();

  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [fetchClasses, fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(query);
        const matchNIS = s.username.toLowerCase().includes(query);
        if (!matchName && !matchNIS) return false;
      }
      if (selectedClassFilter !== "ALL") {
        return s.classGroupId === selectedClassFilter;
      }
      return true;
    });
  }, [students, search, selectedClassFilter]);

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

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Daftarkan Siswa Baru
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa berdasarkan nama atau NIS..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          >
            <option value="ALL">Semua Rombel / Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Nama Siswa</th>
                <th className="px-5 py-3.5">NIS / Username</th>
                <th className="px-5 py-3.5">Kelas / Rombel</th>
                <th className="px-5 py-3.5">Ruang Default</th>
                <th className="px-5 py-3.5 text-right">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    Tidak ada siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-[#0d2b5c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {s.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">
                          {s.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-medium">
                      {s.username}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {s.className ? (
                        <ClassBadge name={s.className} size="sm" />
                      ) : (
                        <span className="text-slate-400 italic">
                          Belum ditentukan
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-semibold">
                      {s.roomCode || "LAB-01"}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <UserCheck className="w-3.5 h-3.5" />
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Student Modal */}
      <CreateStudentModal
        open={modalOpen}
        classes={classes}
        onClose={() => setModalOpen(false)}
        onSubmit={createStudent}
      />
    </div>
  );
};

export default StudentListTable;
