"use client";

import { useCallback, useState } from "react";
import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
} from "../domain/dto/ClassGroupDTO";

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

  return {
    classes,
    students,
    isLoading,
    error,
    fetchClasses,
    createClass,
    deleteClass,
    fetchStudents,
    createStudent,
  };
}
