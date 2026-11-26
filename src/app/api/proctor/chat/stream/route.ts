import type { NextRequest } from "next/server";
import {
  listProctorChatMessages,
  normalizeChannelId,
  purgeChannelIfExamEnded,
  subscribeProctorChat,
} from "@/modules/proctor/application/usecases/ProctorChatStore";
import { requireRequestRole } from "@/security/serverAuth";

const ALLOWED_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

export async function GET(request: NextRequest): Promise<Response> {
  const { errorResponse } = await requireRequestRole(request, ALLOWED_ROLES);
  if (errorResponse) {
    return errorResponse;
  }

  const channelId = normalizeChannelId(
    request.nextUrl.searchParams.get("channelId"),
  );
  await purgeChannelIfExamEnded(channelId);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          closed = true;
        }
      };

      // Send current channel snapshot immediately
      send("init", listProctorChatMessages(channelId));

      // Subscribe to real-time message and channel-clear events
      const unsubscribe = subscribeProctorChat(channelId, (evt) => {
        if (evt.type === "message") {
          send("message", evt.payload);
        } else if (evt.type === "cleared") {
          send("cleared", { channelId: evt.channelId, reason: evt.reason });
        }
      });

      // Keep-alive heartbeat + automatic exam-end purge check every 25 seconds
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          closed = true;
        }
        void purgeChannelIfExamEnded(channelId);
      }, 25_000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
