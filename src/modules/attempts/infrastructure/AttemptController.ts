import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/domain/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { AttemptService } from "../application/service/AttemptService";
import type {
  SubmitAttemptInputDTO,
  SyncBatchRequestDTO,
} from "../domain/dto/SyncBatchDTO";
import {
  recordViolationSchema,
  startAttemptSchema,
  submitAttemptSchema,
  syncBatchSchema,
} from "./attempt.validator";

export class AttemptController extends BaseController {
  constructor(private readonly attemptService: AttemptService) {
    super();
  }

  public async startAttempt(
    req: NextRequest,
    context?: { userId?: string; deviceHash?: string; ipAddress?: string },
  ): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = startAttemptSchema.safeParse(body);

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const userId =
        context?.userId || req.headers.get("x-user-id") || "guest-user";
      const deviceHash =
        context?.deviceHash ||
        req.headers.get("x-device-fingerprint") ||
        "unknown-device";
      const ipAddress =
        context?.ipAddress || req.headers.get("x-forwarded-for") || "127.0.0.1";

      const result = await this.attemptService.startAttempt({
        examId: parsed.data.examId,
        roomToken: parsed.data.roomToken,
        userId,
        deviceHash,
        ipAddress,
      });

      return this.handleResult(result, 201);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }

  public async syncBatch(
    req: NextRequest,
    attemptId: string,
  ): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = syncBatchSchema.safeParse({ ...body, attemptId });

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const result = await this.attemptService.syncBatchAnswers(
        parsed.data as unknown as SyncBatchRequestDTO,
      );
      return this.handleResult(result, 200);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }

  public async recordViolation(
    req: NextRequest,
    attemptId: string,
  ): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = recordViolationSchema.safeParse({ ...body, attemptId });

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const result = await this.attemptService.recordViolation(parsed.data);
      return this.handleResult(result, 200);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }

  public async submitAttempt(
    req: NextRequest,
    attemptId: string,
  ): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => ({}));
      const parsed = submitAttemptSchema.safeParse({ ...body, attemptId });

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const result = await this.attemptService.submitAttempt(
        parsed.data as unknown as SubmitAttemptInputDTO,
      );
      return this.handleResult(result, 200);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }
}
