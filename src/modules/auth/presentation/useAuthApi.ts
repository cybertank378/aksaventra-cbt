import { useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  ExchangeMoodleLaunchInput,
  ExchangeMoodleLaunchOutput,
  LoginInput,
  LoginOutput,
  VerifyExamTokenInput,
  VerifyExamTokenOutput,
} from "../domain/dto/AuthDTO";

export function useAuthApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (input: LoginInput): Promise<LoginOutput> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<LoginOutput>("/api/auth/login", {
        method: "POST",
        body: input,
      });
      return unwrapApiResponse(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        "/api/auth/logout",
        { method: "POST" },
      );
      unwrapApiResponse(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyExamToken = async (
    input: VerifyExamTokenInput,
  ): Promise<VerifyExamTokenOutput> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<VerifyExamTokenOutput>(
        "/api/auth/verify-token",
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verifikasi token gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeMoodleLaunch = async (
    input: ExchangeMoodleLaunchInput,
  ): Promise<ExchangeMoodleLaunchOutput> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<ExchangeMoodleLaunchOutput>(
        "/api/auth/moodle-launch",
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Moodle launch gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    verifyExamToken,
    exchangeMoodleLaunch,
    isLoading,
    error,
  };
}
