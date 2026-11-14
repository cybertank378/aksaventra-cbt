import { AppError } from "./AppError";

export class ApiError extends AppError {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode = 500,
    code = "API_ERROR",
    details?: unknown,
  ) {
    super(message, details);
    this.statusCode = statusCode;
    this.code = code;
  }
}
