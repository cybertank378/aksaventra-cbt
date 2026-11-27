import argon2 from "argon2";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleZodError } from "@/core/errors/handleZodError";
import { prisma } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import { requireRequestRole } from "@/security/serverAuth";
import { usersController } from "./_factory";

const createStaffUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(64, "Username maksimal 64 karakter")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip",
    ),
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(120, "Nama lengkap maksimal 120 karakter"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(128, "Kata sandi maksimal 128 karakter"),
  role: z.enum(["ADMIN", "TEACHER", "PROCTOR"]),
  roomCode: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
  if (errorResponse) {
    return errorResponse;
  }
  return await usersController.listUsers(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
  if (errorResponse) {
    return errorResponse;
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

  const parsed = createStaffUserSchema.safeParse(body);
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

  const { username, fullName, password, role, isActive = true } = parsed.data;
  const normalizedRoom = parsed.data.roomCode?.trim().toUpperCase() || null;

  if (role === "PROCTOR" && !normalizedRoom) {
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

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "USERNAME_EXISTS",
          message: `Username '${username}' sudah terdaftar.`,
        },
      },
      { status: 409 },
    );
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const created = await prisma.user.create({
    data: {
      username,
      fullName,
      passwordHash,
      role,
      roomCode: role === "PROCTOR" ? normalizedRoom : null,
      isActive,
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

  // Push newly created staff user & Moodle role (e.g. Teacher + Course creator) to Moodle
  const syncResult = await moodleSyncService
    .pushStudentToMoodle({
      id: created.id,
      username: created.username,
      fullName: created.fullName,
      password,
      role: created.role,
      isActive: created.isActive,
    })
    .catch(() => ({ synced: false, moodleId: undefined }));

  return NextResponse.json(
    {
      success: true,
      data: {
        ...created,
        moodleUserId: syncResult.moodleId ?? created.moodleUserId,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
