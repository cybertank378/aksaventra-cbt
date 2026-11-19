"use client";

import { CheckSquare, Filter, Search, Square, Users } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import type {
  ClassGroupDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
} from "@/modules/classes/domain/dto/ClassGroupDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";
import { extractStudentFullnameAndLastname } from "./CreateClassModal";

export interface EditClassModalProps {
  open: boolean;
  classGroup: ClassGroupDTO | null;
  students?: StudentDTO[];
  onClose: () => void;
  onSave: (id: string, data: UpdateClassGroupInputDTO) => Promise<boolean>;
}

export const EditClassModal: FC<EditClassModalProps> = ({
  open,
  classGroup,
  students = [],
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [lastnameFilter, setLastnameFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichedStudents = useMemo(
    () =>
      students.map((s) => {
        const { fullname, lastname } = extractStudentFullnameAndLastname(s);
        return {
          ...s,
          parsedFullname: fullname,
          parsedLastname: lastname,
        };
      }),
    [students],
  );

  const availableLastnames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of enrichedStudents) {
      if (s.parsedLastname) {
        counts.set(s.parsedLastname, (counts.get(s.parsedLastname) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [enrichedStudents]);

  useEffect(() => {
    if (classGroup) {
      setName(classGroup.name);
      setCode(classGroup.code || "");
      setDescription(classGroup.description || "");
      setSelectedStudentIds(
        students
          .filter(
            (s) =>
              s.classGroupId === classGroup.id ||
              s.className === classGroup.name,
          )
          .map((s) => s.id),
      );
      setStudentSearch("");
      setLastnameFilter("ALL");
      setError(null);
    }
  }, [classGroup, students]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return enrichedStudents.filter((s) => {
      if (
        lastnameFilter !== "ALL" &&
        s.parsedLastname.toLowerCase() !== lastnameFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        s.parsedFullname.toLowerCase().includes(q) ||
        s.parsedLastname.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q)
      );
    });
  }, [enrichedStudents, studentSearch, lastnameFilter]);

  if (!classGroup) return null;

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...filteredIds])),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kelas wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await onSave(classGroup.id, {
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
        studentIds: selectedStudentIds,
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Rombongan Belajar & Anggota Siswa"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Nama Kelas / Lastname *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Kode Kelas"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: IX-1"
          />
        </div>

        <TextField
          label="Deskripsi / Keterangan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Keterangan tambahan..."
        />

        {/* Student Assignment Picker with Lastname Filter */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0097a7]" />
              <span className="text-xs font-bold text-slate-800">
                Kelola Anggota Siswa di Kelas {classGroup.name}
              </span>
              <Badge color="teal" size="sm" variant="soft">
                {selectedStudentIds.length} siswa terpilih
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                aria-label="Filter berdasarkan Lastname"
                value={lastnameFilter}
                onChange={(e) => setLastnameFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-[#0097a7] focus:outline-none"
              >
                <option value="ALL">
                  Semua Lastname ({enrichedStudents.length})
                </option>
                {availableLastnames.map(([ln, count]) => (
                  <option key={ln} value={ln}>
                    Lastname: {ln} ({count} siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari fullname, lastname, atau NIS/username..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0097a7] focus:outline-none"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              onClick={toggleAllFiltered}
              disabled={filteredStudents.length === 0}
            >
              {filteredStudents.length > 0 &&
              filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                ? "Batal Pilih Semua"
                : `Pilih Semua (${filteredStudents.length})`}
            </Button>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada siswa ditemukan.
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                const isCurrentClass =
                  s.classGroupId === classGroup.id ||
                  s.className === classGroup.name;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition ${
                      isSelected ? "bg-[#0097a7]/8" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-[#0097a7]" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {s.parsedFullname}
                        </p>
                        <p className="truncate text-[11px] font-mono text-slate-500">
                          Username: {s.username} • Lastname:{" "}
                          <span className="font-semibold text-slate-700">
                            {s.parsedLastname || "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {s.parsedLastname && (
                        <Badge color="teal" size="sm" variant="soft">
                          Lastname: {s.parsedLastname}
                        </Badge>
                      )}
                      {isCurrentClass ? (
                        <Badge color="success" size="sm" variant="soft">
                          Anggota Kelas Ini
                        </Badge>
                      ) : s.className ? (
                        <Badge color="warning" size="sm" variant="soft">
                          Kelas: {s.className}
                        </Badge>
                      ) : (
                        <Badge color="neutral" size="sm" variant="soft">
                          Belum ada kelas
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="sm"
            loading={isLoading}
          >
            Simpan Kelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditClassModal;
