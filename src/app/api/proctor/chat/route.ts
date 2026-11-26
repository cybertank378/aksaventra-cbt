import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleZodError } from "@/core/errors/handleZodError";
import { prisma } from "@/libs/prisma";
import {
  appendProctorChatMessage,
  clearProctorChatChannel,
  listProctorChatMessages,
  normalizeChannelId,
  purgeChannelIfExamEnded,
} from "@/modules/proctor/application/usecases/ProctorChatStore";
import { requireRequestRole } from "@/security/serverAuth";

const ALLOWED_ROLES = ["ADMIN", "TEACHER", "PROCTOR"] as const;

const sendProctorChatSchema = z.object({
  channelId: z.string().trim().max(80).optional(),
  roomCode: z.string().trim().max(40).optional(),
  category: z.enum(["INFO", "ISSUE", "URGENT"]).optional(),
  message: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(1000, "Pesan maksimal 1000 karakter"),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { errorResponse } = await requireRequestRole(request, ALLOWED_ROLES);
  if (errorResponse) {
    return errorResponse;
  }

  const channelId = normalizeChannelId(
    request.nextUrl.searchParams.get("channelId"),
  );
  await purgeChannelIfExamEnded(channelId);
  const messages = await listProctorChatMessages(channelId);

  return NextResponse.json({
    success: true,
    data: messages,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { session, errorResponse } = await requireRequestRole(
    request,
    ALLOWED_ROLES,
  );
  if (errorResponse || !session) {
    return (
      errorResponse ??
      NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Autentikasi diperlukan." },
        },
        { status: 401 },
      )
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Format request tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = sendProctorChatSchema.safeParse(body);
  if (!parsed.success) {
    const appErr = handleZodError(parsed.error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: appErr.code,
          message: appErr.message,
          details: appErr.details,
        },
      },
      { status: 400 },
    );
  }

  const channelId = normalizeChannelId(parsed.data.channelId);
  const isEnded = await purgeChannelIfExamEnded(channelId);
  if (isEnded && channelId !== "GLOBAL") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXAM_ENDED",
          message:
            "Sesi ujian telah selesai. Riwayat chat koordinasi telah dihapus otomatis.",
        },
      },
      { status: 410 },
    );
  }

  const dbUser = await prisma.user
    .findUnique({
      where: { id: session.userId },
      select: { fullName: true, roomCode: true },
    })
    .catch(() => null);

  const created = await appendProctorChatMessage({
    channelId,
    senderId: session.userId,
    senderName: dbUser?.fullName || session.username || session.role,
    senderRole: session.role,
    roomCode: parsed.data.roomCode || dbUser?.roomCode || null,
    category: parsed.data.category ?? "INFO",
    message: parsed.data.message,
  });

  return NextResponse.json(
    {
      success: true,
      data: created,
    },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { errorResponse } = await requireRequestRole(request, [
    "ADMIN",
    "PROCTOR",
  ]);
  if (errorResponse) {
    return errorResponse;
  }

  const channelId = normalizeChannelId(
    request.nextUrl.searchParams.get("channelId"),
  );
  await clearProctorChatChannel(channelId, "Dibersihkan oleh pengawas/admin");

  return NextResponse.json({
    success: true,
    data: { channelId, cleared: true },
  });
}
