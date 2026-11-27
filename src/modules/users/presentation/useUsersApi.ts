"use client";

import { useCallback, useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  CreateStaffUserInputDTO,
  ListUsersOutput,
  ListUsersQuery,
  UpdateStaffUserInputDTO,
  UserResponseDTO,
} from "../domain/dto/UserDTO";

export function useUsersApi() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async (): Promise<UserResponseDTO> => {
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
  }, []);

  const fetchUsers = useCallback(
    async (query: ListUsersQuery = {}): Promise<ListUsersOutput> => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.role) params.set("role", query.role);
        if (query.excludeRole) params.set("excludeRole", query.excludeRole);
        if (query.roomCode) params.set("roomCode", query.roomCode);
        if (query.search) params.set("search", query.search);
        if (query.page) params.set("page", String(query.page));
        if (query.limit) params.set("limit", String(query.limit));

        const qs = params.toString();
        const response = await apiRequest<ListUsersOutput>(
          `/api/users${qs ? `?${qs}` : ""}`,
        );
        const data = unwrapApiResponse(response);
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat daftar pengguna";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createStaffUser = useCallback(
    async (input: CreateStaffUserInputDTO): Promise<UserResponseDTO> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiRequest<UserResponseDTO>("/api/users", {
          method: "POST",
          body: input,
        });
        const created = unwrapApiResponse(response);
        setUsers((prev) => [created, ...prev]);
        setTotal((prev) => prev + 1);
        return created;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal menambahkan akun staf";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateStaffUser = useCallback(
    async (
      id: string,
      input: UpdateStaffUserInputDTO,
    ): Promise<UserResponseDTO> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiRequest<UserResponseDTO>(
          `/api/users/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            body: input,
          },
        );
        const updated = unwrapApiResponse(response);
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memperbarui akun staf";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteStaffUser = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ id: string; deleted: boolean }>(
        `/api/users/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      unwrapApiResponse(response);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus akun staf";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    total,
    fetchCurrentUser,
    fetchUsers,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
    isLoading,
    error,
  };
}

export default useUsersApi;
