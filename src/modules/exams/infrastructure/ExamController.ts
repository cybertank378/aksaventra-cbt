import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import {
  requireRequestRole,
  verifyRequestSession,
} from "@/security/serverAuth";
import type { ExamService } from "../application/service/ExamService";
import { createExamSchema, updateExamSchema } from "./exam.validator";

const EXAM_MANAGER_ROLES = ["ADMIN", "TEACHER"] as const;
const EXAM_STAFF_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

export class ExamController extends BaseController {
  constructor(private readonly examService: ExamService) {
    super();
  }

  public async listStudentExams(request: NextRequest): Promise<NextResponse> {
    const session = await verifyRequestSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sesi peserta tidak ditemukan. Silakan login kembali.",
          },
        },
        { status: 401 },
      );
    }

    const result = await this.examService.listStudentExams(session.userId);
    return this.handleResult(result, 200);
  }

  public async getSnapshot(
    examId: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const session = await verifyRequestSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sesi pengguna tidak ditemukan. Silakan login kembali.",
          },
        },
        { status: 401 },
      );
    }

    if (!examId || examId.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Parameter ID Ujian wajib disertakan",
          },
        },
        { status: 400 },
      );
    }

    const result = await this.examService.getSnapshot({ examId });
    return this.handleResult(result, 200);
  }

  public async getById(
    examId: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const session = await verifyRequestSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sesi pengguna tidak ditemukan. Silakan login kembali.",
          },
        },
        { status: 401 },
      );
    }

    const result = await this.examService.getExamById(examId);
    if (result.isFailure) {
      return this.handleResult(result);
    }

    return NextResponse.json({
      success: true,
      data: result.value.toClientSnapshotDTO(),
    });
  }

  public async listExams(request: NextRequest): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_STAFF_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const result = await this.examService.listExams();
    if (result.isFailure) {
      return this.handleResult(result);
    }

    return NextResponse.json({
      success: true,
      data: result.value.map((e) => e.toClientSnapshotDTO()),
    });
  }

  public async createExam(request: NextRequest): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const body = await request.json();
      const parseResult = createExamSchema.safeParse(body);

      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
        );
      }

      const result = await this.examService.createExam(parseResult.data);
      return this.handleResult(result, 201);
    } catch (_err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Format payload request tidak valid",
          },
        },
        { status: 400 },
      );
    }
  }

  public async updateExam(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const body = await request.json();
      const parseResult = updateExamSchema.safeParse(body);

      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
        );
      }

      const result = await this.examService.updateExam({
        id,
        ...parseResult.data,
      });

      return this.handleResult(result, 200);
    } catch (_err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Format payload request tidak valid",
          },
        },
        { status: 400 },
      );
    }
  }

  public async assignGroups(
    examId: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const body = await request.json();
      const result = await this.examService.assignGroupsToExam({
        examId,
        classGroupIds: body.classGroupIds || [],
        roomCode: body.roomCode,
        seatPrefix: body.seatPrefix,
      });
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async getRoster(
    examId: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    if (request) {
      const { errorResponse } = await requireRequestRole(
        request,
        EXAM_STAFF_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
    }

    try {
      const result = await this.examService.getRoster(examId);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async updateSeat(request: NextRequest): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const body = await request.json();
      const result = await this.examService.updateSeat({
        examId: body.examId,
        studentId: body.studentId,
        roomCode: body.roomCode,
        seatNumber: body.seatNumber,
      });
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async updateSchedule(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const body = await request.json();
      const result = await this.examService.updateSchedule(id, body);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async deleteExam(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(
      request,
      EXAM_MANAGER_ROLES,
    );
    if (errorResponse) {
      return errorResponse;
    }

    try {
      const result = await this.examService.deleteExam(id);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }
}
