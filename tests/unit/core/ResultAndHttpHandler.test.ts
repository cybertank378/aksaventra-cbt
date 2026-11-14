import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BaseEntity } from "@/core/base/BaseEntity";
import { Result } from "@/core/base/Result";
import { DomainError } from "@/core/errors/DomainError";
import { formatZodError, handleZodError } from "@/core/errors/handleZodError";
import { OptimisticLockError } from "@/core/errors/OptimisticLockError";
import { HttpResultHandler } from "@/core/utils/HttpResultHandler";
import { RouteParamHelper } from "@/core/utils/RouteParamHelper";

class TestEntity extends BaseEntity<string> {
  constructor(
    id: string,
    public readonly name: string,
  ) {
    super(id);
  }
}

describe("Core Base - Result<T, E>", () => {
  it("should create successful Result and access value", () => {
    const result = Result.ok({ id: "123", name: "John Doe" });

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.value).toEqual({ id: "123", name: "John Doe" });
    expect(() => result.error).toThrow(
      "Cannot access error of a successful Result",
    );
  });

  it("should create failed Result and access error", () => {
    const error = DomainError.notFound("User", "123");
    const result = Result.fail(error);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe(error);
    expect(() => result.value).toThrow(
      "Cannot access value of a failed Result",
    );
  });
});

describe("Core Base - BaseEntity", () => {
  it("should compare entity equality by ID", () => {
    const entity1 = new TestEntity("e-1", "First");
    const entity2 = new TestEntity("e-1", "First Duplicate");
    const entity3 = new TestEntity("e-2", "Second");

    expect(entity1.equals(entity2)).toBe(true);
    expect(entity1.equals(entity3)).toBe(false);
    expect(entity1.equals(null)).toBe(false);
    expect(entity1.equals(undefined)).toBe(false);
    expect(entity1.equals(entity1)).toBe(true);
  });
});

describe("Core Errors", () => {
  it("DomainError should create standardized error variants", () => {
    const notFound = DomainError.notFound("Exam", "ex-10");
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");
    expect(notFound.message).toContain("Exam with id 'ex-10' not found");

    const forbidden = DomainError.forbidden();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");

    const unauthorized = DomainError.unauthorized();
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.code).toBe("UNAUTHORIZED");

    const badRequest = DomainError.badRequest("Invalid attempt");
    expect(badRequest.statusCode).toBe(400);
    expect(badRequest.code).toBe("BAD_REQUEST");
  });

  it("OptimisticLockError should contain version conflict metadata", () => {
    const conflict = new OptimisticLockError("Version conflict", 2, 1);
    expect(conflict.statusCode).toBe(409);
    expect(conflict.code).toBe("OPTIMISTIC_LOCK_CONFLICT");
    expect(conflict.currentVersion).toBe(2);
    expect(conflict.attemptedVersion).toBe(1);
  });

  it("handleZodError and formatZodError should format schema errors", () => {
    const schema = z.object({
      username: z.string().min(3, "Username too short"),
      age: z.number({ message: "Age is required" }),
    });

    const parsed = schema.safeParse({ username: "ab" });
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      expect(formatted.fieldErrors.username).toContain("Username too short");
      expect(formatted.fieldErrors.age).toBeDefined();

      const validationError = handleZodError(parsed.error);
      expect(validationError.statusCode).toBe(422);
      expect(validationError.code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("Core Utils - HttpResultHandler", () => {
  it("should map Result.ok to 200 NextResponse with ApiResponse format", async () => {
    const result = Result.ok({ score: 100 });
    const response = HttpResultHandler.handle(result);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      success: true,
      data: { score: 100 },
    });
  });

  it("should map Result.ok to custom 201 status", async () => {
    const result = Result.ok({ created: true });
    const response = HttpResultHandler.handle(result, 201);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.created).toBe(true);
  });

  it("should map DomainError to corresponding HTTP status (404/403/400)", async () => {
    const notFound = DomainError.notFound("Attempt", "att-1");
    const response = HttpResultHandler.handle(Result.fail(notFound));

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("should map OptimisticLockError to 409 Conflict", async () => {
    const lockError = new OptimisticLockError("Stale sync version", 5, 4);
    const response = HttpResultHandler.handle(Result.fail(lockError));

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("OPTIMISTIC_LOCK_CONFLICT");
    expect(json.error.details).toEqual({
      currentVersion: 5,
      attemptedVersion: 4,
    });
  });

  it("should map ZodError to 422 Unprocessable Entity", async () => {
    const schema = z.object({
      token: z.string().length(6, "Token must be 6 digits"),
    });
    const parsed = schema.safeParse({ token: "123" });

    if (!parsed.success) {
      const response = HttpResultHandler.handleError(parsed.error);
      expect(response.status).toBe(422);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.details.token).toBeDefined();
    }
  });

  it("should map unknown errors to 500 Internal Server Error", async () => {
    const response = HttpResultHandler.handleError(
      new Error("Unexpected database failure"),
    );
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(json.error.message).toBe("Unexpected database failure");
  });
});

describe("Core Utils - RouteParamHelper", () => {
  it("should resolve parameter from Promise params", async () => {
    const paramsPromise = Promise.resolve({ attemptId: "att-999", step: "1" });
    const attemptId = await RouteParamHelper.getParam(
      paramsPromise,
      "attemptId",
    );
    expect(attemptId).toBe("att-999");
  });

  it("should reject missing or array parameters", async () => {
    const paramsPromise = Promise.resolve({
      slug: ["a", "b"],
      empty: undefined,
    });

    await expect(
      RouteParamHelper.getParam(paramsPromise, "slug"),
    ).rejects.toThrow("Missing or invalid route parameter: slug");
    await expect(
      RouteParamHelper.getParam(paramsPromise, "empty"),
    ).rejects.toThrow("Missing or invalid route parameter: empty");
  });
});
