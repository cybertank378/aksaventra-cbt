import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export const createStudentSchema = z.object({
  username: z.string().min(1, "NIS/Username wajib diisi"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  classGroupId: z.string().optional(),
  className: z.string().optional(),
  roomCode: z.string().optional(),
});

export const assignStudentSchema = z.object({
  studentId: z.string().min(1, "ID siswa wajib diisi"),
  classGroupId: z.string().min(1, "ID kelas wajib diisi"),
  className: z.string().optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateStudentSchema = z.object({
  username: z.string().min(1, "NIS/Username wajib diisi").optional(),
  fullName: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
  classGroupId: z.string().nullable().optional(),
  className: z.string().nullable().optional(),
  roomCode: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bulkAssignStudentClassSchema = z.object({
  studentIds: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal 1 siswa terlebih dahulu"),
  classGroupId: z.string().nullable(),
});
