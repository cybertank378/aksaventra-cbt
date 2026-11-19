import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { DomainError } from "@/core/errors/DomainError";
import { handleZodError } from "@/core/errors/handleZodError";
import type { SyncService } from "../application/service/SyncService";
import {
  moodleWebhookSchema,
  syncManageSchema,
  triggerSyncSchema,
} from "./sync.validator";

const WEBHOOK_SECRET =
  process.env.MOODLE_WEBHOOK_SECRET || "aksaventra_sync_secret_2026";

export class SyncController extends BaseController {
  constructor(private readonly syncService: SyncService) {
    super();
  }

  public async getStatus(): Promise<NextResponse> {
    return this.handleResult(Result.ok(this.syncService.getStatus()), 200);
  }

  public async triggerSync(request?: NextRequest): Promise<NextResponse> {
    let rawBody: unknown = {};
    if (request) {
      const text = await request.text();
      if (text.trim() !== "") {
        try {
          rawBody = JSON.parse(text);
        } catch {
          return this.handleResult(
            Result.fail(
              DomainError.badRequest("Format request JSON tidak valid"),
            ),
          );
        }
      }
    }

    const parsed = triggerSyncSchema.safeParse(rawBody);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.syncService.pullMasterData(parsed.data);
    return this.handleResult(
      result,
      result.isSuccess && result.value.success ? 200 : 207,
    );
  }

  public async manageSync(request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return this.handleResult(
        Result.fail(DomainError.badRequest("Format request JSON tidak valid")),
      );
    }

    const parsed = syncManageSchema.safeParse(body);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    if (parsed.data.mode === "full") {
      const result = await this.syncService.syncAllBidirectional();
      return this.handleResult(
        result,
        result.isSuccess && result.value.success ? 200 : 207,
      );
    }

    if (parsed.data.mode === "pull") {
      const result = await this.syncService.pullMasterData({
        entity: parsed.data.entity,
      });
      return this.handleResult(
        result,
        result.isSuccess && result.value.success ? 200 : 207,
      );
    }

    const pushResult = await this.syncService.pushEntityById(
      parsed.data.entity,
      parsed.data.id,
    );
    return this.handleResult(pushResult, 200);
  }

  public async handleWebhook(request: NextRequest): Promise<NextResponse> {
    const incomingSecret = request.headers.get("x-moodle-webhook-secret") || "";
    if (incomingSecret !== WEBHOOK_SECRET) {
      return this.handleResult(
        Result.fail(DomainError.unauthorized("Unauthorized webhook request")),
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return this.handleResult(
        Result.fail(
          DomainError.badRequest("Format payload webhook tidak valid"),
        ),
      );
    }

    const parsed = moodleWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.syncService.handleWebhook(parsed.data);
    return this.handleResult(
      result,
      result.isSuccess && result.value.success ? 200 : 207,
    );
  }

  public async proxyMoodleRequest(
    request: NextRequest,
    wsfunction: string[],
  ): Promise<NextResponse> {
    const rawBody =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined;

    const result = await this.syncService.proxyMoodleRequest({
      wsfunction,
      method: request.method,
      searchParams: request.nextUrl.searchParams,
      contentType: request.headers.get("content-type") || "",
      rawBody,
    });

    if (result.isFailure) {
      return this.handleResult(result);
    }

    return NextResponse.json(result.value.data, {
      status: result.value.status,
    });
  }
}
