"use client";

import { useCallback, useState } from "react";
import type {
  AnnouncementItemDTO,
  CreateAnnouncementInputDTO,
} from "../domain/dto/AnnouncementDTO";

export function useAnnouncementsApi() {
  const [announcements, setAnnouncements] = useState<AnnouncementItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat pengumuman");
      }
    } catch {
      setError("Gangguan jaringan saat memuat pengumuman");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(
    async (input: CreateAnnouncementInputDTO): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setAnnouncements((prev) => [json.data, ...prev]);
          return true;
        }
        setError(json.error?.message || "Gagal membuat pengumuman");
        return false;
      } catch {
        setError("Gangguan jaringan saat membuat pengumuman");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
  };
}
