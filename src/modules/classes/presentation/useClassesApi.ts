"use client";

import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type {
  BatchImportClassesResultDTO,
  BulkAssignStudentsClassInputDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  EnrollStudentsInputDTO,
  EnrollStudentsResultDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
} from "../domain/dto/ClassGroupDTO";

export interface ImportStudentsResultDTO {
  success: boolean;
  message: string;
  processedCount: number;
  moodleSyncedCount?: number;
  enrolledCount?: number;
  errors?: string[];
}

export interface ImportStudentsOptionsDTO {
  defaultClassGroupId?: string | null;
  subjectId?: string | null;
  courseName?: string | null;
  examId?: string | null;
  roomCode?: string;
  seatPrefix?: string;
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
      options?: ImportStudentsOptionsDTO | number,
    ): Promise<ImportStudentsResultDTO> => {
      setIsLoading(true);
      setError(null);
      try {
        const opts: ImportStudentsOptionsDTO =
          typeof options === "number" ? {} : (options ?? {});
        const res = await fetch("/api/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            csvText: rawCsvText,
            defaultClassGroupId: opts.defaultClassGroupId || null,
            subjectId: opts.subjectId || null,
            courseName: opts.courseName || null,
            examId: opts.examId || null,
            roomCode: opts.roomCode,
            seatPrefix: opts.seatPrefix,
          }),
        });

        const json = await res.json();
        const data = json.data;
        if (json.success && data) {
          const msg =
            json.message ||
            `Berhasil mengimpor ${data.processedCount || 0} siswa.`;
          showSuccessToast(msg);
          await Promise.all([fetchStudents(), fetchClasses()]);
          return {
            success: true,
            message: msg,
            processedCount: data.processedCount || 0,
            moodleSyncedCount: data.moodleSyncedCount || 0,
            enrolledCount: data.enrolledCount || 0,
            errors: data.errors || [],
          };
        }

        const errMsg =
          json.error?.message || json.message || "Gagal mengimpor data siswa.";
        showErrorToast(errMsg);
        setError(errMsg);
        return {
          success: false,
          message: errMsg,
          processedCount: data?.processedCount || 0,
          errors: data?.errors || [errMsg],
        };
      } catch {
        const connErr = "Gangguan jaringan saat mengimpor data siswa.";
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
    [fetchStudents, fetchClasses],
  );

  const enrollStudents = useCallback(
    async (
      input: EnrollStudentsInputDTO,
    ): Promise<EnrollStudentsResultDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/students/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const resData = json.data as EnrollStudentsResultDTO;
          const targetLabel =
            resData.examTitle || resData.courseName || "Course / Ujian";
          showSuccessToast(
            `${resData.enrolledCount} siswa berhasil didaftarkan ke ${targetLabel}${resData.moodleSynced ? " (tersinkron ke Moodle)" : ""}.`,
          );
          return resData;
        }
        const msg =
          json.error?.message || "Gagal mendaftarkan siswa ke course/ujian";
        showErrorToast(msg);
        setError(msg);
        return null;
      } catch {
        const msg = "Gangguan jaringan saat mendaftarkan siswa ke course/ujian";
        showErrorToast(msg);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
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

  const importClasses = useCallback(
    async (
      rawCsvText: string,
    ): Promise<
      BatchImportClassesResultDTO & { success: boolean; message: string }
    > => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/classes/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvText: rawCsvText }),
        });
        const json = await res.json();
        const data = json.data as BatchImportClassesResultDTO | undefined;
        if (json.success && data) {
          const msg =
            json.message ||
            `Berhasil mengimpor ${data.processedCount} kelas (${data.assignedStudentsCount} siswa dikelompokkan).`;
          showSuccessToast(msg);
          await Promise.all([fetchClasses(), fetchStudents()]);
          return {
            success: true,
            message: msg,
            processedCount: data.processedCount,
            assignedStudentsCount: data.assignedStudentsCount,
            moodleSyncedCount: data.moodleSyncedCount,
            errors: data.errors || [],
          };
        }
        const errMsg =
          json.error?.message || json.message || "Gagal mengimpor data kelas.";
        showErrorToast(errMsg);
        setError(errMsg);
        return {
          success: false,
          message: errMsg,
          processedCount: data?.processedCount || 0,
          assignedStudentsCount: data?.assignedStudentsCount || 0,
          moodleSyncedCount: data?.moodleSyncedCount || 0,
          errors: data?.errors || [errMsg],
        };
      } catch {
        const connErr = "Gangguan jaringan saat mengimpor data kelas.";
        showErrorToast(connErr);
        setError(connErr);
        return {
          success: false,
          message: connErr,
          processedCount: 0,
          assignedStudentsCount: 0,
          moodleSyncedCount: 0,
          errors: [connErr],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchClasses, fetchStudents],
  );

  const exportClassesCsv = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/classes/export");
      const json = await res.json();
      if (json.success && json.data?.csvData) {
        return json.data.csvData as string;
      }
      const msg = json.error?.message || "Gagal mengekspor data kelas";
      showErrorToast(msg);
      setError(msg);
      return null;
    } catch {
      const msg = "Gangguan jaringan saat mengekspor data kelas";
      showErrorToast(msg);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    enrollStudents,
    exportStudents,
    importClasses,
    exportClassesCsv,
  };
}
