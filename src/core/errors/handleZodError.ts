import type { ZodError } from "zod";
import { AppError } from "./AppError";

export class ValidationError extends AppError {
  public readonly statusCode = 422;
  public readonly code = "VALIDATION_ERROR";
}

export function formatZodError(error: ZodError): {
  message: string;
  fieldErrors: Record<string, string[]>;
} {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  const message = Object.entries(fieldErrors)
    .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
    .join("; ");

  return {
    message: message || "Validation failed",
    fieldErrors,
  };
}

export function handleZodError(error: ZodError): ValidationError {
  const { message, fieldErrors } = formatZodError(error);
  return new ValidationError(message, fieldErrors);
}
