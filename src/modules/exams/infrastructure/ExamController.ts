import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { ExamService } from "../application/ExamService";
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
    const exam = await this.examService.getExamById(examId);
    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXAM_NOT_FOUND",
            message: `Ujian dengan ID '${examId}' tidak ditemukan`,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: exam.toClientSnapshotDTO(),
    });
  }

  public async listExams(): Promise<NextResponse> {
    const exams = await this.examService.listExams();
    return NextResponse.json({
      success: true,
      data: exams.map((e) => e.toClientSnapshotDTO()),
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
