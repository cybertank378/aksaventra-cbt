import { useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type { UserResponseDTO } from "../domain/dto/UserDTO";

export function useUsersApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async (): Promise<UserResponseDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<UserResponseDTO>("/api/users/me");
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat profil pengguna";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCurrentUser,
    isLoading,
    error,
  };
}

export default useUsersApi;

