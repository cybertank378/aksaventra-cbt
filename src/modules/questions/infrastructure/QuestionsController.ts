import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/domain/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { QuestionsService } from "../application/service/QuestionsService";
import {
  bulkGroupQuestionsSchema,
  createQuestionSchema,
  questionsFilterSchema,
  updateQuestionSchema,
} from "./questions.validator";

export class QuestionsController extends BaseController {
  constructor(private readonly questionsService: QuestionsService) {
    super();
  }

  public async getQuestions(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const query = {
        subject: searchParams.get("subject") || undefined,
        gradeLevel: searchParams.get("gradeLevel") || undefined,
        type: (searchParams.get("type") as unknown) || undefined,
        search: searchParams.get("search") || undefined,
      };

      const parseResult = questionsFilterSchema.safeParse(query);
      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
          400,
        );
      }

      const result = await this.questionsService.getQuestions(parseResult.data);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async getQuestionById(id: string): Promise<NextResponse> {
    try {
      const result = await this.questionsService.getQuestionById(id);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async createQuestion(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parseResult = createQuestionSchema.safeParse(body);

      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
          400,
        );
      }

      const result = await this.questionsService.createQuestion(
        parseResult.data,
      );
      return this.handleResult(result, 201);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async updateQuestion(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parseResult = updateQuestionSchema.safeParse(body);

      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
          400,
        );
      }

      const result = await this.questionsService.updateQuestion(
        id,
        parseResult.data,
      );
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async deleteQuestion(id: string): Promise<NextResponse> {
    try {
      const result = await this.questionsService.deleteQuestion(id);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async bulkGroupQuestions(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parseResult = bulkGroupQuestionsSchema.safeParse(body);
      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
          400,
        );
      }
      const result = await this.questionsService.bulkGroupQuestions(
        parseResult.data.ids,
        {
          gradeLevel: parseResult.data.gradeLevel,
          subject: parseResult.data.subject,
        },
      );
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }
}
