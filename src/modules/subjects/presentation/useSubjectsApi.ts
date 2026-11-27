"use client";

import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type {
  CreateSubjectInputDTO,
  SubjectDetailDTO,
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../domain/dto/SubjectDTO";

export function useSubjectsApi() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subjects?detailed=true", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubjects(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat mata pelajaran");
      }
    } catch {
      setError("Gangguan jaringan saat memuat mata pelajaran");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubjectById = useCallback(
    async (id: string): Promise<SubjectDetailDTO | null> => {
      try {
        const res = await fetch(`/api/subjects/${id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as SubjectDetailDTO;
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  const createSubject = useCallback(
    async (input: CreateSubjectInputDTO): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          showSuccessToast(`Mata pelajaran "${json.data.name}" disimpan`);
          await fetchSubjects();
          return true;
        }
        const msg = json.error?.message || "Gagal membuat mata pelajaran";
        showErrorToast(msg);
        setError(msg);
        return false;
      } catch {
        const msg = "Gangguan jaringan saat membuat mata pelajaran";
        showErrorToast(msg);
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSubjects],
  );

  const updateSubject = useCallback(
    async (
      id: string,
      input: UpdateSubjectInputDTO,
    ): Promise<SubjectDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/subjects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSubjects((prev) => prev.map((s) => (s.id === id ? json.data : s)));
          const isVisibilityOnly =
            input.isVisible !== undefined &&
            input.name === undefined &&
            input.shortName === undefined &&
            input.description === undefined;
          showSuccessToast(
            isVisibilityOnly
              ? input.isVisible
                ? "Course ditampilkan di CBT & Moodle"
                : "Course disembunyikan di CBT & Moodle"
              : "Mata pelajaran berhasil diperbarui",
          );
          return json.data as SubjectDTO;
        }
        const msg = json.error?.message || "Gagal memperbarui mata pelajaran";
        showErrorToast(msg);
        setError(msg);
        return null;
      } catch {
        const msg = "Gangguan jaringan saat memperbarui mata pelajaran";
        showErrorToast(msg);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteSubject = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        showSuccessToast("Mata pelajaran berhasil dihapus");
        return true;
      }
      const msg = json.error?.message || "Gagal menghapus mata pelajaran";
      showErrorToast(msg);
      setError(msg);
      return false;
    } catch {
      const msg = "Gangguan jaringan saat menghapus mata pelajaran";
      showErrorToast(msg);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    fetchSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
