import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { GetExamRecapitulationUseCase } from "../application/usecases/GetExamRecapitulationUseCase";

export class RecapitulationController extends BaseController {
  private readonly useCase = new GetExamRecapitulationUseCase();

  public async getRecapitulation(
    _request: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const data = await this.useCase.execute(examId);
      return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memuat data rekapitulasi";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }
}

export const recapitulationController = new RecapitulationController();
