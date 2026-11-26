import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/domain/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import { prisma } from "@/libs/prisma";
import { parseStoredRoomAndSeat } from "@/libs/roomSeatUtils";
import { requireRequestRole } from "@/security/serverAuth";
import type { ProctorService } from "../application/service/ProctorService";
import {
  getRoomParticipantsSchema,
  proctorActionSchema,
  rotateRoomTokenSchema,
} from "./proctor.validator";

const PROCTOR_ALLOWED_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

export class ProctorController extends BaseController {
  constructor(private readonly proctorService: ProctorService) {
    super();
  }

  /**
   * Enforces 1-Proctor = 1-Room isolation.
   * For PROCTOR accounts, returns their assigned roomCode and forbids accessing other rooms.
   * ADMIN and TEACHER may view all rooms or filter freely.
   */
  private async resolveProctorRoomScope(req: NextRequest): Promise<
    | {
        userId: string;
        role: "ADMIN" | "TEACHER" | "PROCTOR";
        assignedRoomCode: string | null;
        errorResponse: null;
      }
    | {
        userId: null;
        role: null;
        assignedRoomCode: null;
        errorResponse: NextResponse;
      }
  > {
    const { session, errorResponse } = await requireRequestRole(
      req,
      PROCTOR_ALLOWED_ROLES,
    );
    if (errorResponse || !session) {
      return {
        userId: null,
        role: null,
        assignedRoomCode: null,
        errorResponse:
          errorResponse ??
          NextResponse.json(
            {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Autentikasi pengawas diperlukan.",
              },
            },
            { status: 401 },
          ),
      };
    }

    if (session.role === "PROCTOR") {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { roomCode: true },
      });
      const parsed = parseStoredRoomAndSeat(dbUser?.roomCode);
      const assignedRoom = parsed.roomCode?.trim().toUpperCase() || null;

      if (!assignedRoom) {
        return {
          userId: null,
          role: null,
          assignedRoomCode: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              error: {
                code: "PROCTOR_ROOM_NOT_ASSIGNED",
                message:
                  "Akun pengawas Anda belum ditugaskan ke ruang ujian mana pun. Hubungi Admin.",
              },
            },
            { status: 403 },
          ),
        };
      }

      return {
        userId: session.userId,
        role: "PROCTOR",
        assignedRoomCode: assignedRoom,
        errorResponse: null,
      };
    }

    return {
      userId: session.userId,
      role: session.role as "ADMIN" | "TEACHER",
      assignedRoomCode: null,
      errorResponse: null,
    };
  }

  public async getParticipants(
    req: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const scope = await this.resolveProctorRoomScope(req);
      if (scope.errorResponse) {
        return scope.errorResponse;
      }

      const { searchParams } = new URL(req.url);
      const requestedRoom = searchParams.get("roomCode")?.trim() || undefined;
      const statusParam = searchParams.get("status") || undefined;

      if (scope.role === "PROCTOR" && scope.assignedRoomCode) {
        if (
          requestedRoom &&
          requestedRoom.toUpperCase() !== scope.assignedRoomCode
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "PROCTOR_ROOM_FORBIDDEN",
                message: `Akses ditolak: Anda hanya berwenang memantau ruang ${scope.assignedRoomCode}, bukan ruang ${requestedRoom}.`,
              },
            },
            { status: 403 },
          );
        }
      }

      const effectiveRoomCode =
        scope.role === "PROCTOR" && scope.assignedRoomCode
          ? scope.assignedRoomCode
          : requestedRoom;

      const parsed = getRoomParticipantsSchema.safeParse({
        examId,
        roomCode: effectiveRoomCode,
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
      const scope = await this.resolveProctorRoomScope(req);
      if (scope.errorResponse) {
        return scope.errorResponse;
      }

      const body = await req.json();
      const parsed = proctorActionSchema.safeParse(body);

      if (!parsed.success) {
        return this.handleResult(
          Result.fail(handleZodError(parsed.error)),
          400,
        );
      }

      if (scope.role === "PROCTOR" && scope.assignedRoomCode) {
        const targetAttempt = await prisma.attempt.findUnique({
          where: { id: parsed.data.attemptId },
          include: { user: { select: { roomCode: true } } },
        });
        if (targetAttempt) {
          const studentRoom = parseStoredRoomAndSeat(
            targetAttempt.user.roomCode,
          ).roomCode.toUpperCase();
          if (studentRoom !== scope.assignedRoomCode) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: "PROCTOR_ROOM_FORBIDDEN",
                  message: `Akses ditolak: Peserta berada di ruang ${studentRoom}, bukan di ruang tugas Anda (${scope.assignedRoomCode}).`,
                },
              },
              { status: 403 },
            );
          }
        }
      }

      const proctorId = scope.userId || parsed.data.proctorId || "proctor";

      switch (parsed.data.action) {
        case "lock": {
          const res = await this.proctorService.lockParticipant({
            attemptId: parsed.data.attemptId,
            proctorId,
            reason: parsed.data.reason,
          });
          return this.handleResult(res, 200);
        }
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
