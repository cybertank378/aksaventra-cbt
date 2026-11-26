"use client";

import { useCallback, useState } from "react";
import { apiRequest } from "./apiRequest";
import { unwrapApiResponse } from "./unwrapApiResponse";

export interface UploadImageResponseDTO {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export function useUploadApi() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadImageResponseDTO> => {
      setIsUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiRequest<UploadImageResponseDTO>(
          "/api/upload",
          {
            method: "POST",
            body: formData,
            timeoutMs: 30_000,
          },
        );
        return unwrapApiResponse(response);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi gangguan jaringan saat mengunggah gambar.";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    uploadImage,
    isUploading,
    error,
  };
}
