import { AppError } from "./AppError";

export class DomainError extends AppError {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode = 400,
    code = "DOMAIN_ERROR",
    details?: unknown,
  ) {
    super(message, details);
    this.statusCode = statusCode;
    this.code = code;
  }

  public static notFound(entity: string, id?: string | number): DomainError {
    return new DomainError(
      `${entity}${id !== undefined ? ` with id '${id}'` : ""} not found`,
      404,
      "NOT_FOUND",
    );
  }

  public static forbidden(message = "Access forbidden"): DomainError {
    return new DomainError(message, 403, "FORBIDDEN");
  }

  public static unauthorized(message = "Unauthorized"): DomainError {
    return new DomainError(message, 401, "UNAUTHORIZED");
  }

  public static badRequest(message: string, details?: unknown): DomainError {
    return new DomainError(message, 400, "BAD_REQUEST", details);
  }

  public static conflict(message: string, details?: unknown): DomainError {
    return new DomainError(message, 409, "CONFLICT", details);
  }
}
