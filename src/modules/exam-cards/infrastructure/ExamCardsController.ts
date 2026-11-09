import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import type { ExamCardsService } from "../application/service/ExamCardsService";

export class ExamCardsController extends BaseController {
  constructor(private readonly cardsService: ExamCardsService) {
    super();
  }

  public async getCards(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const query = {
        classGroupId: searchParams.get("classGroupId") || undefined,
        examId: searchParams.get("examId") || undefined,
      };

      const result = await this.cardsService.getCards(query);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }
}
