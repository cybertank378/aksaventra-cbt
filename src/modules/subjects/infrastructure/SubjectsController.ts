import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import { requireRequestRole } from "@/security/serverAuth";
import type { SubjectsService } from "../application/service/SubjectsService";
import { createSubjectSchema, updateSubjectSchema } from "./subjects.validator";

const SUBJECT_MANAGER_ROLES = ["ADMIN", "TEACHER"] as const;

export class SubjectsController extends BaseController {
  constructor(private readonly subjectsService: SubjectsService) {
    super();
  }

  public async getSubjects(request?: NextRequest): Promise<NextResponse> {
    try {
      const detailed = request?.nextUrl.searchParams.get("detailed") === "true";
      if (detailed) {
        const subjects = await this.subjectsService.getAllDetailed();
        return NextResponse.json(
          { success: true, data: subjects },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      const names = await this.subjectsService.getAllNames();
      return NextResponse.json(
        { success: true, data: names },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err: unknown) {
      return this.handleUnexpectedError(err);
    }
  }

  public async getSubjectById(id: string): Promise<NextResponse> {
    try {
      const subject = await this.subjectsService.getById(id);
      if (!subject) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Mata pelajaran tidak ditemukan" },
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: true, data: subject },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err: unknown) {
      return this.handleUnexpectedError(err);
    }
  }

  public async createSubject(request: NextRequest): Promise<NextResponse> {
    try {
      const { errorResponse } = await requireRequestRole(
        request,
        SUBJECT_MANAGER_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
      const body = await request.json();
      const parsed = createSubjectSchema.safeParse(body);
      if (!parsed.success) {
        return this.handleResult(Result.fail(handleZodError(parsed.error)));
      }
      const created = await this.subjectsService.create(parsed.data);
      return NextResponse.json(
        { success: true, data: created },
        { status: 201 },
      );
    } catch (err: unknown) {
      return this.handleUnexpectedError(err);
    }
  }

  public async updateSubject(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const { errorResponse } = await requireRequestRole(
        request,
        SUBJECT_MANAGER_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
      const body = await request.json();
      const parsed = updateSubjectSchema.safeParse(body);
      if (!parsed.success) {
        return this.handleResult(Result.fail(handleZodError(parsed.error)));
      }
      const updated = await this.subjectsService.update(id, parsed.data);
      if (!updated) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Mata pelajaran tidak ditemukan" },
          },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: updated });
    } catch (err: unknown) {
      return this.handleUnexpectedError(err);
    }
  }

  public async deleteSubject(
    id: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    try {
      if (request) {
        const { errorResponse } = await requireRequestRole(
          request,
          SUBJECT_MANAGER_ROLES,
        );
        if (errorResponse) {
          return errorResponse;
        }
      }
      const deleted = await this.subjectsService.delete(id);
      if (!deleted) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Mata pelajaran tidak ditemukan" },
          },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: { id } });
    } catch (err: unknown) {
      return this.handleUnexpectedError(err);
    }
  }
}
