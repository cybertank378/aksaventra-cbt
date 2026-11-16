import { type NextRequest, NextResponse } from "next/server";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type { MoodleWebhookPayload } from "@/modules/sync/domain/dto/SyncDTO";

const WEBHOOK_SECRET =
  process.env.MOODLE_WEBHOOK_SECRET || "aksaventra_sync_secret_2026";

export async function POST(request: NextRequest) {
  const incomingSecret = request.headers.get("x-moodle-webhook-secret") || "";
  if (incomingSecret !== WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_WEBHOOK_SECRET",
          message: "Unauthorized webhook request",
        },
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as MoodleWebhookPayload;
    if (!body?.entity || !body?.action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_WEBHOOK_PAYLOAD",
            message: "entity and action are required",
          },
        },
        { status: 400 },
      );
    }

    const result = await moodleSyncService.handleWebhookEvent(body);
    return NextResponse.json(
      {
        success: result.success,
        data: result,
      },
      { status: result.success ? 200 : 207 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WEBHOOK_PROCESSING_ERROR",
          message:
            err instanceof Error ? err.message : "Failed to process webhook",
        },
      },
      { status: 500 },
    );
  }
}
