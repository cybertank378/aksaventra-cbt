import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import type { AnnouncementsService } from "../application/service/AnnouncementsService";

export class AnnouncementsController extends BaseController {
  constructor(private readonly service: AnnouncementsService) {
    super();
  }

  public async getAnnouncements(): Promise<NextResponse> {
    try {
      const result = await this.service.getAnnouncements();
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async createAnnouncement(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const author = request.headers.get("x-user-name") || "Panitia CBT";
      const result = await this.service.createAnnouncement(body, author);
      return this.handleResult(result, 201);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }

  public async deleteAnnouncement(id: string): Promise<NextResponse> {
    try {
      const result = await this.service.deleteAnnouncement(id);
      return this.handleResult(result, 200);
    } catch (err) {
      return this.handleUnexpectedError(err);
    }
  }
}
