import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { requireRequestRole } from "@/security/serverAuth";
import { GetExamRecapitulationUseCase } from "../application/usecases/GetExamRecapitulationUseCase";

const RECAP_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

export class RecapitulationController extends BaseController {
  private readonly useCase = new GetExamRecapitulationUseCase();

  public async getRecapitulation(
    request: NextRequest,
    examId: string,
  ): Promise<NextResponse> {
    try {
      const { errorResponse } = await requireRequestRole(request, RECAP_ROLES);
      if (errorResponse) {
        return errorResponse;
      }

      const data = await this.useCase.execute(examId);
      return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
      console.error("[RecapitulationController.getRecapitulation]", err);
      return NextResponse.json(
        {
          success: false,
          error: { message: "Gagal memuat data rekapitulasi" },
        },
        { status: 500 },
      );
    }
  }
}

export const recapitulationController = new RecapitulationController();
