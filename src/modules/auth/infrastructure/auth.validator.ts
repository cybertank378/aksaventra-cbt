import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string({ message: "Username wajib diisi" })
    .trim()
    .min(1, { message: "Username tidak boleh kosong" }),
  password: z
    .string({ message: "Password wajib diisi" })
    .min(1, { message: "Password tidak boleh kosong" }),
  deviceHash: z.string().optional(),
  ipAddress: z.string().optional(),
  examId: z.string().optional(),
});

export const verifyExamTokenSchema = z.object({
  examId: z
    .string({ message: "ID Ujian wajib diisi" })
    .trim()
    .min(1, { message: "ID Ujian tidak boleh kosong" }),
  token: z
    .string({ message: "Token ujian wajib diisi" })
    .trim()
    .min(1, { message: "Token tidak boleh kosong" }),
});

export const moodleLaunchSchema = z.object({
  moodleUserId: z.number({ message: "moodleUserId harus berupa angka" }).int(),
  moodleCbtId: z.number({ message: "moodleCbtId harus berupa angka" }).int(),
  launchToken: z
    .string({ message: "launchToken wajib diisi" })
    .min(1, { message: "launchToken tidak boleh kosong" }),
  deviceHash: z
    .string({ message: "deviceHash wajib diisi" })
    .min(1, { message: "deviceHash tidak boleh kosong" }),
  ipAddress: z.string().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type VerifyExamTokenRequest = z.infer<typeof verifyExamTokenSchema>;
export type MoodleLaunchRequest = z.infer<typeof moodleLaunchSchema>;
