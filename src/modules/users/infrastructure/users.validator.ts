import { z } from "zod";

export const userRoleSchema = z.enum([
  "ADMIN",
  "TEACHER",
  "PROCTOR",
  "STUDENT",
]);

export const staffRoleSchema = z.enum(["ADMIN", "TEACHER", "PROCTOR"]);

export const listUsersQuerySchema = z.object({
  role: userRoleSchema.optional(),
  excludeRole: userRoleSchema.optional(),
  roomCode: z.string().trim().max(40).optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
});

export const createStaffUserSchema = z.object({
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
  role: staffRoleSchema,
  roomCode: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateStaffUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  password: z.string().min(6).max(128).optional(),
  role: staffRoleSchema.optional(),
  roomCode: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bulkUpdateRoleSchema = z.object({
  userIds: z
    .array(z.string().trim().min(1))
    .min(1, "Pilih minimal satu pengguna.")
    .max(200, "Maksimal 200 pengguna per pembaruan massal."),
  role: userRoleSchema,
  roomCode: z.string().trim().max(40).nullable().optional(),
});
