import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/domain/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { ProctorService } from "../application/service/ProctorService";
import {
  getRoomParticipantsSchema,
  proctorActionSchema,
  rotateRoomTokenSchema,
} from "./proctor.validator";

export class ProctorController extends BaseController {
  constructor(private readonly proctorService: ProctorService) {
    super();
  }

  public async getParticipants(
    req: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const roomCode = searchParams.get("roomCode") || undefined;
      const statusParam = searchParams.get("status") || undefined;

      const parsed = getRoomParticipantsSchema.safeParse({
        examId,
        roomCode,
        status: statusParam,
      });

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const result = await this.proctorService.getRoomParticipants(parsed.data);
      return this.handleResult(result, 200);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }

  public async rotateToken(
    req: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => ({}));
      const parsed = rotateRoomTokenSchema.safeParse(body);

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const result = await this.proctorService.rotateRoomToken({
        examId,
        manualToken: parsed.data.manualToken,
        expiresInSeconds: parsed.data.expiresInSeconds,
      });

      return this.handleResult(result, 200);
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }

  public async executeAction(
    req: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = proctorActionSchema.safeParse(body);

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      const proctorId =
        req.headers.get("x-user-id") || parsed.data.proctorId || "proctor";

      switch (parsed.data.action) {
        case "unlock": {
          const res = await this.proctorService.unlockParticipant({
            attemptId: parsed.data.attemptId,
            proctorId,
            reason: parsed.data.reason,
          });
          return this.handleResult(res, 200);
        }
        case "reset_device": {
          const res = await this.proctorService.resetDeviceBinding({
            attemptId: parsed.data.attemptId,
            proctorId,
            reason: parsed.data.reason,
          });
          return this.handleResult(res, 200);
        }
        case "extend_time": {
          const res = await this.proctorService.extendParticipantTime({
            attemptId: parsed.data.attemptId,
            extendMinutes: parsed.data.extendMinutes ?? 10,
            proctorId,
            reason: parsed.data.reason,
          });
          return this.handleResult(res, 200);
        }
        case "force_submit": {
          const res = await this.proctorService.forceSubmitAttempt({
            attemptId: parsed.data.attemptId,
            examId,
            proctorId,
            reason: parsed.data.reason,
          });
          return this.handleResult(res, 200);
        }
        default:
          return NextResponse.json(
            { success: false, error: { message: "Invalid action type" } },
            { status: 400 },
          );
      }
    } catch (error) {
      return this.handleUnexpectedError(error);
    }
  }
}
