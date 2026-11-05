import { ApiError } from "@/core/errors/ApiError";
import type { ApiResponse } from "@/core/types/ApiResponse";

/**
 * Unwraps an ApiResponse<T>.
 * Returns payload data if successful; throws ApiError if unsuccessful.
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data;
  }

  const { error } = response;
  throw new ApiError(
    error.message || "API request failed",
    400,
    error.code || "API_RESPONSE_ERROR",
    error.details,
  );
}
