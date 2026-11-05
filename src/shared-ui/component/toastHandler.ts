import type { ApiError } from "@/core/http/errors/ApiError";
import { getErrorMessage } from "@/core/shared/utils/errorUtils";
import { showErrorToast } from "@/shared-ui/component/Toast";

export const handleApiErrorToast = (error?: ApiError | null) => {
  const message = getErrorMessage(error);
  showErrorToast(message);
};
