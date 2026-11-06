import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { ExamService } from "../application/service/ExamService";
import { createExamSchema, updateExamSchema } from "./exam.validator";

export class ExamController extends BaseController {
  constructor(private readonly examService: ExamService) {
    super();
  }

  public async getSnapshot(examId: string): Promise<NextResponse> {
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

  public async getById(examId: string): Promise<NextResponse> {
    const result = await this.examService.getExamById(examId);
    if (result.isFailure) {
      return this.handleResult(result);
    }

    return NextResponse.json({
      success: true,
      data: result.value.toClientSnapshotDTO(),
    });
  }

  public async listExams(): Promise<NextResponse> {
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
}
