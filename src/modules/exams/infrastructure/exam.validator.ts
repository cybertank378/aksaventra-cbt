import { z } from "zod";

export const moodleQuestionOptionSchema = z.object({
  key: z.string().trim(),
  html: z.string(),
});

export const moodleQuestionItemSchema = z.object({
  slot: z.coerce.number().int().min(1),
  questionId: z.coerce.number().int().min(1),
  type: z.string().trim().min(1),
  stemHtml: z.string(),
  options: z.array(moodleQuestionOptionSchema).optional().default([]),
});

export const moodleAttemptManifestSchema = z.object({
  attemptId: z.coerce.number().int().min(1),
  timeStart: z.coerce.number().int(),
  extraTimeSeconds: z.coerce.number().int().default(0),
  remainingSeconds: z.coerce.number().int(),
  strikeCount: z.coerce.number().int().default(0),
  status: z.string().trim().default("in_progress"),
  syncVersion: z.coerce.number().int().default(0),
});

/**
 * Defensive schema for Moodle Web Service mod_cbt_get_exam_manifest response.
 * Uses z.coerce.number() to robustly parse string numbers emitted by PHP web services.
 */
export const moodleExamManifestSchema = z.object({
  examId: z.coerce.number().int().min(1),
  title: z.string().trim().min(1),
  durationSeconds: z.coerce.number().int().min(60),
  maxStrikes: z.coerce.number().int().min(1).default(3),
  serverTimestamp: z.coerce.number().int(),
  attempt: moodleAttemptManifestSchema,
  questions: z.array(moodleQuestionItemSchema),
});

export const createExamSchema = z.object({
  moodleCbtId: z.coerce
    .number()
    .int()
    .min(1, { message: "moodleCbtId wajib berupa angka valid" }),
  title: z.string({ message: "Judul ujian wajib diisi" }).trim().min(1),
  courseName: z
    .string({ message: "Nama mata pelajaran wajib diisi" })
    .trim()
    .min(1),
  durationSeconds: z.coerce.number().int().min(60).default(7200),
  maxStrikes: z.coerce.number().int().min(1).default(3),
  sebRequired: z.boolean().default(false),
  sebConfigKey: z.string().optional().nullable(),
  activeToken: z.string({ message: "Token ujian wajib diisi" }).trim().min(1),
  tokenExpiresAt: z.coerce.date({
    message: "Waktu kedaluwarsa token wajib diisi",
  }),
  questions: z.array(moodleQuestionItemSchema),
  answerKeys: z.record(z.string(), z.string()).optional(),
  timeOpen: z.coerce.date({ message: "Waktu buka ujian wajib diisi" }),
  timeClose: z.coerce.date({ message: "Waktu tutup ujian wajib diisi" }),
});

export const updateExamSchema = z.object({
  title: z.string().trim().min(1).optional(),
  durationSeconds: z.coerce.number().int().min(60).optional(),
  maxStrikes: z.coerce.number().int().min(1).optional(),
  sebRequired: z.boolean().optional(),
  sebConfigKey: z.string().optional().nullable(),
  activeToken: z.string().trim().min(1).optional(),
  tokenExpiresAt: z.coerce.date().optional(),
  timeOpen: z.coerce.date().optional(),
  timeClose: z.coerce.date().optional(),
});

export type MoodleExamManifest = z.infer<typeof moodleExamManifestSchema>;
export type CreateExamRequest = z.infer<typeof createExamSchema>;
export type UpdateExamRequest = z.infer<typeof updateExamSchema>;
