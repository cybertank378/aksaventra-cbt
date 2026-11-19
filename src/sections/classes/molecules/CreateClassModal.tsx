"use client";

import { CheckSquare, Filter, Search, Square, Users } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import type { StudentDTO } from "@/modules/classes/domain/dto/ClassGroupDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  students?: StudentDTO[];
  onSubmit: (data: {
    name: string;
    code?: string;
    description?: string;
    studentIds?: string[];
  }) => Promise<boolean>;
}

export function extractStudentFullnameAndLastname(student: StudentDTO): {
  fullname: string;
  lastname: string;
} {
  const raw = student.fullName.trim();
  const explicitClass = (student.className || "").trim();

  if (explicitClass) {
    const suffix = ` ${explicitClass}`;
    if (
      raw.toLowerCase().endsWith(suffix.toLowerCase()) &&
      raw.length > suffix.length
    ) {
      return {
        fullname: raw.slice(0, raw.length - suffix.length).trim(),
        lastname: explicitClass,
      };
    }
    return {
      fullname: raw,
      lastname: explicitClass,
    };
  }

  const parts = raw.split(/\s+/);
  if (parts.length > 1) {
    return {
      fullname: parts.slice(0, -1).join(" "),
      lastname: parts[parts.length - 1] || "",
    };
  }

  return {
    fullname: raw,
    lastname: "",
  };
}

export const CreateClassModal: FC<CreateClassModalProps> = ({
  open,
  onClose,
  students = [],
  onSubmit,
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

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return enrichedStudents.filter((s) => {
      if (lastnameFilter === "UNASSIGNED" && (s.classGroupId || s.className)) {
        return false;
      }
      if (
        lastnameFilter !== "ALL" &&
        lastnameFilter !== "UNASSIGNED" &&
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

  const handleSelectLastnameGroup = (targetLastname: string) => {
    setLastnameFilter(targetLastname);
    if (
      targetLastname !== "ALL" &&
      targetLastname !== "UNASSIGNED" &&
      !name.trim()
    ) {
      setName(targetLastname);
      if (!code.trim()) {
        setCode(targetLastname);
      }
    }
  };

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
      const success = await onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        studentIds:
          selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
      });
      if (success) {
        setName("");
        setCode("");
        setDescription("");
        setSelectedStudentIds([]);
        setStudentSearch("");
        setLastnameFilter("ALL");
        onClose();
      } else {
        setError("Gagal menyimpan data kelas.");
      }
    } catch {
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !isLoading && onClose()}
      title="Tambah Rombel / Kelas Baru"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            id="class-name"
            label="Nama Kelas / Lastname (Wajib)"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: IX-1 atau XII MIPA 1"
            size="sm"
          />

          <TextField
            id="class-code"
            label="Kode Rombel / Cohort (Opsional)"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: IX-1"
            size="sm"
          />
        </div>

        <TextField
          id="class-desc"
          label="Keterangan / Jurusan (Opsional)"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Rombel Kelas IX-1"
          size="sm"
        />

        {/* Student Assignment Picker with Lastname Filter & Grouping */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0097a7]" />
              <span className="text-xs font-bold text-slate-800">
                Daftar Siswa (Filter & Kelompokkan berdasarkan Lastname)
              </span>
              <Badge color="teal" size="sm" variant="soft">
                {selectedStudentIds.length} dipilih
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                aria-label="Filter berdasarkan Lastname"
                value={lastnameFilter}
                onChange={(e) => handleSelectLastnameGroup(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-[#0097a7] focus:outline-none"
              >
                <option value="ALL">
                  Semua Lastname ({enrichedStudents.length})
                </option>
                <option value="UNASSIGNED">
                  Belum Masuk Kelas (
                  {
                    enrichedStudents.filter(
                      (s) => !s.classGroupId && !s.className,
                    ).length
                  }
                  )
                </option>
                {availableLastnames.map(([ln, count]) => (
                  <option key={ln} value={ln}>
                    Lastname: {ln} ({count} siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {availableLastnames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 mr-1">
                Kelompok Lastname:
              </span>
              <button
                type="button"
                onClick={() => handleSelectLastnameGroup("ALL")}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition ${
                  lastnameFilter === "ALL"
                    ? "bg-[#0d2b5c] text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              {availableLastnames.map(([ln, count]) => (
                <button
                  key={ln}
                  type="button"
                  onClick={() => handleSelectLastnameGroup(ln)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition ${
                    lastnameFilter === ln
                      ? "bg-[#0097a7] text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {ln} ({count})
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari fullname, lastname (mis. IX-1), atau NIS/username..."
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
                {students.length === 0
                  ? "Belum ada data siswa terdaftar. Anda tetap dapat membuat kelas terlebih dahulu."
                  : "Tidak ada siswa yang cocok dengan filter fullname / lastname."}
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
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
                      {s.className ? (
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

        {error && (
          <p className="text-xs font-semibold text-rose-600">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            loading={isLoading}
          >
            Simpan Kelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassModal;
