"use client";

import { useCallback, useState } from "react";
import type {
  AssignGroupInputDTO,
  ExamParticipantDTO,
  ExamScheduleInputDTO,
} from "../domain/dto/ExamRosterDTO";
import type { ExamSnapshotDTO } from "../domain/dto/ExamSnapshotDTO";

export function useExamManagementApi(examId?: string) {
  const [participants, setParticipants] = useState<ExamParticipantDTO[]>([]);
  const [exam, setExam] = useState<ExamSnapshotDTO | null>(null);
  const [examsList, setExamsList] = useState<ExamSnapshotDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExamsList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exams");
      const json = await res.json();
      if (json.success && json.data) {
        setExamsList(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat daftar ujian");
      }
    } catch {
      setError("Gangguan jaringan saat memuat daftar ujian");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExam = useCallback(
    async (id?: string) => {
      const targetId = id || examId;
      if (!targetId) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${targetId}/snapshot`);
        const json = await res.json();
        if (json.success && json.data) {
          setExam(json.data);
        } else {
          setError(json.error?.message || "Gagal memuat snapshot ujian");
        }
      } catch {
        setError("Gangguan jaringan saat memuat data ujian");
      } finally {
        setIsLoading(false);
      }
    },
    [examId],
  );

  const fetchParticipants = useCallback(
    async (id?: string) => {
      const targetId = id || examId;
      if (!targetId) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${targetId}/participants`);
        const json = await res.json();
        if (json.success && json.data) {
          setParticipants(json.data);
        } else {
          setError(json.error?.message || "Gagal memuat peserta ujian");
        }
      } catch {
        setError("Gangguan jaringan saat memuat peserta ujian");
      } finally {
        setIsLoading(false);
      }
    },
    [examId],
  );

  const assignGroups = useCallback(
    async (
      input: Omit<AssignGroupInputDTO, "examId"> & { targetExamId?: string },
    ): Promise<boolean> => {
      const targetId = input.targetExamId || examId;
      if (!targetId) return false;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${targetId}/assign-groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classGroupIds: input.classGroupIds,
            roomCode: input.roomCode,
            seatPrefix: input.seatPrefix,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setParticipants(json.data);
          return true;
        }
        setError(json.error?.message || "Gagal menugaskan rombel ke ujian");
        return false;
      } catch {
        setError("Gangguan jaringan saat menugaskan rombel");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [examId],
  );

  const updateSeat = useCallback(
    async (
      studentId: string,
      roomCode: string,
      seatNumber: string,
    ): Promise<boolean> => {
      if (!examId) return false;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${examId}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId, studentId, roomCode, seatNumber }),
        });
        const json = await res.json();
        if (json.success) {
          setParticipants((prev) =>
            prev.map((p) =>
              p.studentId === studentId ? { ...p, roomCode, seatNumber } : p,
            ),
          );
          return true;
        }
        setError(json.error?.message || "Gagal memperbarui nomor meja");
        return false;
      } catch {
        setError("Gangguan jaringan saat memperbarui nomor meja");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [examId],
  );

  const createSchedule = useCallback(
    async (input: ExamScheduleInputDTO): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moodleCbtId: Math.floor(1000 + Math.random() * 9000),
            title: input.title,
            courseName: input.courseName,
            durationSeconds: input.durationMinutes * 60,
            maxStrikes: input.maxStrikes || 3,
            sebRequired: input.sebRequired || false,
            activeToken: input.activeToken.toUpperCase(),
            tokenExpiresAt: new Date(Date.now() + 7200 * 1000).toISOString(),
            timeOpen: new Date(input.timeOpen).toISOString(),
            timeClose: new Date(input.timeClose).toISOString(),
            questions: [],
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          return json.data.examId;
        }
        setError(json.error?.message || "Gagal membuat jadwal ujian");
        return null;
      } catch {
        setError("Gangguan jaringan saat membuat jadwal ujian");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    exam,
    examsList,
    participants,
    isLoading,
    error,
    fetchExam,
    fetchExamsList,
    fetchParticipants,
    assignGroups,
    updateSeat,
    createSchedule,
  };
}
