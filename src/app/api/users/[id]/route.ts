import argon2 from "argon2";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleZodError } from "@/core/errors/handleZodError";
import { prisma } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import { requireRequestRole } from "@/security/serverAuth";

const updateStaffUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum(["ADMIN", "TEACHER", "PROCTOR"]).optional(),
  roomCode: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
  if (errorResponse) {
    return errorResponse;
  }

  const { id } = await context.params;
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

  const parsed = updateStaffUserSchema.safeParse(body);
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

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, roomCode: true },
  });
  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan." },
      },
      { status: 404 },
    );
  }

  const nextRole = parsed.data.role ?? existing.role;
  const nextRoomCode =
    parsed.data.roomCode !== undefined
      ? parsed.data.roomCode?.trim().toUpperCase() || null
      : existing.roomCode;

  if (nextRole === "PROCTOR" && !nextRoomCode) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ROOM_REQUIRED",
          message:
            "Kode ruang ujian wajib diisi untuk akun Proktor (1 Proktor = 1 Ruang).",
        },
      },
      { status: 400 },
    );
  }

  const passwordHash = parsed.data.password
    ? await argon2.hash(parsed.data.password, { type: argon2.argon2id })
    : undefined;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.fullName !== undefined
        ? { fullName: parsed.data.fullName }
        : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      roomCode: nextRole === "PROCTOR" ? nextRoomCode : null,
      ...(parsed.data.isActive !== undefined
        ? { isActive: parsed.data.isActive }
        : {}),
    },
    select: {
      id: true,
      moodleUserId: true,
      username: true,
      fullName: true,
      role: true,
      className: true,
      roomCode: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await moodleSyncService
    .pushStudentToMoodle({
      id: updated.id,
      moodleUserId: updated.moodleUserId,
      username: updated.username,
      fullName: updated.fullName,
      password: parsed.data.password,
      role: updated.role,
      isActive: updated.isActive,
    })
    .catch(() => undefined);

  return NextResponse.json({
    success: true,
    data: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { session, errorResponse } = await requireRequestRole(request, [
    "ADMIN",
  ]);
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

  const { id } = await context.params;
  if (id === session.userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CANNOT_DELETE_SELF",
          message: "Anda tidak dapat menghapus akun Anda sendiri.",
        },
      },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, moodleUserId: true },
  });
  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan." },
      },
      { status: 404 },
    );
  }

  await prisma.user.delete({ where: { id } });

  if (existing.moodleUserId && existing.moodleUserId > 0) {
    await moodleSyncService
      .deleteEntityInMoodle("user", existing.moodleUserId)
      .catch(() => undefined);
  }

  return NextResponse.json({
    success: true,
    data: { id, deleted: true },
  });
}
