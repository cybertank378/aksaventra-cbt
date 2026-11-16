"use client";

import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type {
  BulkAssignStudentsClassInputDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
} from "../domain/dto/ClassGroupDTO";

export interface ImportStudentsResultDTO {
  success: boolean;
  message: string;
  processedCount: number;
  errors?: string[];
}

export function useClassesApi() {
  const [classes, setClasses] = useState<ClassGroupDTO[]>([]);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.success && json.data) {
        setClasses(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat data kelas");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat memuat kelas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClass = useCallback(
    async (input: CreateClassGroupInputDTO): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setClasses((prev) => [...prev, json.data]);
          return true;
        }
        setError(json.error?.message || "Gagal membuat kelas baru");
        return false;
      } catch {
        setError("Gangguan jaringan saat membuat kelas");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteClass = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      setError(json.error?.message || "Gagal menghapus kelas");
      return false;
    } catch {
      setError("Gangguan jaringan saat menghapus kelas");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (classGroupId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = classGroupId
        ? `/api/students?classGroupId=${encodeURIComponent(classGroupId)}`
        : "/api/students";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat daftar siswa");
      }
    } catch {
      setError("Gangguan jaringan saat memuat data siswa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStudent = useCallback(
    async (input: CreateStudentInputDTO): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setStudents((prev) => [...prev, json.data]);
          return true;
        }
        setError(json.error?.message || "Gagal mendaftarkan siswa");
        return false;
      } catch {
        setError("Gangguan jaringan saat mendaftarkan siswa");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const importStudents = useCallback(
    async (
      rawCsvText: string,
      cbtId: number = 1,
    ): Promise<ImportStudentsResultDTO> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/moodle-proxy/mod_cbt_import_export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "import_students",
            cbtid: cbtId,
            payload: rawCsvText,
          }),
        });

        const data = await res.json();
        if (data.success) {
          const msg =
            data.message ||
            `Berhasil mengimpor ${data.processed_count || 0} siswa.`;
          showSuccessToast(msg);
          await fetchStudents();
          return {
            success: true,
            message: msg,
            processedCount: data.processed_count || 0,
            errors: data.errors || [],
          };
        }

        const errMsg = data.message || data.error || "Gagal mengimpor siswa.";
        showErrorToast(errMsg);
        setError(errMsg);
        return {
          success: false,
          message: errMsg,
          processedCount: 0,
          errors: data.errors || [errMsg],
        };
      } catch {
        const connErr = "Gagal terhubung ke Moodle Headless Bridge.";
        showErrorToast(connErr);
        setError(connErr);
        return {
          success: false,
          message: connErr,
          processedCount: 0,
          errors: [connErr],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStudents],
  );

  const exportStudents = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/moodle-proxy/mod_cbt_import_export?action=export_students",
      );
      const data = await res.json();
      if (data.success && data.csv_data) {
        return data.csv_data as string;
      }
      return null;
    } catch {
      setError("Gagal mengekspor data siswa");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClass = useCallback(
    async (
      id: string,
      input: UpdateClassGroupInputDTO,
    ): Promise<ClassGroupDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/classes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setClasses((prev) => prev.map((c) => (c.id === id ? json.data : c)));
          showSuccessToast("Data kelas berhasil diperbarui");
          return json.data as ClassGroupDTO;
        }
        const msg = json.error?.message || "Gagal memperbarui kelas";
        showErrorToast(msg);
        setError(msg);
        return null;
      } catch {
        const msg = "Gangguan jaringan saat memperbarui kelas";
        showErrorToast(msg);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchClassDetails = useCallback(
    async (
      id: string,
    ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null> => {
      setError(null);
      try {
        const res = await fetch(`/api/classes/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as ClassGroupDTO & { students: StudentDTO[] };
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  const updateStudent = useCallback(
    async (
      id: string,
      input: UpdateStudentInputDTO,
    ): Promise<StudentDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/students/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setStudents((prev) => prev.map((s) => (s.id === id ? json.data : s)));
          showSuccessToast("Data siswa berhasil diperbarui");
          return json.data as StudentDTO;
        }
        const msg = json.error?.message || "Gagal memperbarui data siswa";
        showErrorToast(msg);
        setError(msg);
        return null;
      } catch {
        const msg = "Gangguan jaringan saat memperbarui data siswa";
        showErrorToast(msg);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteStudent = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        showSuccessToast("Akun siswa berhasil dihapus");
        return true;
      }
      const msg = json.error?.message || "Gagal menghapus akun siswa";
      showErrorToast(msg);
      setError(msg);
      return false;
    } catch {
      const msg = "Gangguan jaringan saat menghapus akun siswa";
      showErrorToast(msg);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkAssignStudentsClass = useCallback(
    async (input: BulkAssignStudentsClassInputDTO): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/students/assign-class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success) {
          showSuccessToast(
            `${json.data?.updatedCount ?? input.studentIds.length} siswa berhasil dikelompokkan ke kelas`,
          );
          await fetchStudents();
          await fetchClasses();
          return true;
        }
        const msg =
          json.error?.message || "Gagal mengelompokkan siswa ke kelas";
        showErrorToast(msg);
        setError(msg);
        return false;
      } catch {
        const msg = "Gangguan jaringan saat mengelompokkan kelas siswa";
        showErrorToast(msg);
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStudents, fetchClasses],
  );

  return {
    classes,
    students,
    isLoading,
    error,
    fetchClasses,
    fetchClassDetails,
    createClass,
    updateClass,
    deleteClass,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkAssignStudentsClass,
    importStudents,
    exportStudents,
  };
}
