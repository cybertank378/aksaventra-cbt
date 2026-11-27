import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { requireRequestRole } from "@/security/serverAuth";
import type { AnnouncementsService } from "../application/service/AnnouncementsService";

const ANNOUNCEMENT_READ_ROLES = [
  "ADMIN",
  "TEACHER",
  "PROCTOR",
  "STUDENT",
] as const;
const ANNOUNCEMENT_WRITE_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

export class AnnouncementsController extends BaseController {
  constructor(private readonly service: AnnouncementsService) {
    super();
  }

  public async getAnnouncements(request: NextRequest): Promise<NextResponse> {
    try {
      const { errorResponse } = await requireRequestRole(
        request,
        ANNOUNCEMENT_READ_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
      const result = await this.service.getAnnouncements();
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async createAnnouncement(request: NextRequest): Promise<NextResponse> {
    try {
      const { session, errorResponse } = await requireRequestRole(
        request,
        ANNOUNCEMENT_WRITE_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
      if (!session) {
        return this.handleUnexpectedError(
          new Error("Missing verified session"),
        );
      }

      const body = await request.json();
      const author = session.username || "Panitia CBT";
      const result = await this.service.createAnnouncement(body, author);
      return this.handleResult(result, 201);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async deleteAnnouncement(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const { errorResponse } = await requireRequestRole(
        request,
        ANNOUNCEMENT_WRITE_ROLES,
      );
      if (errorResponse) {
        return errorResponse;
      }
      const result = await this.service.deleteAnnouncement(id);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }
}
