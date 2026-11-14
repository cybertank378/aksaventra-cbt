import { z } from "zod";

export const startAttemptSchema = z.object({
  examId: z.string().min(1, "examId is required"),
  roomToken: z.string().optional(),
});

export const answerItemSchema = z.object({
  questionId: z.coerce.number().int().positive(),
  ans: z.custom<import("../domain/dto/SyncBatchDTO").AnswerValue>(),
  flag: z.boolean().default(false),
  ts: z.coerce.number().int().positive(),
});

export const syncBatchSchema = z.object({
  attemptId: z.string().min(1, "attemptId is required"),
  answers: z.array(answerItemSchema),
  syncVersion: z.coerce.number().int().nonnegative().default(0),
});

export const recordViolationSchema = z.object({
  attemptId: z.string().min(1, "attemptId is required"),
  eventType: z.enum([
    "TAB_BLUR",
    "FULLSCREEN_EXIT",
    "DEVTOOLS_OPEN",
    "PROCTOR_UNLOCK",
    "PROCTOR_RESET_DEVICE",
    "TIME_EXTEND",
    "FORCE_SUBMIT",
  ]),
  durationMs: z.coerce.number().nonnegative().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const submitAttemptSchema = z.object({
  attemptId: z.string().min(1, "attemptId is required"),
  finalAnswers: z.array(answerItemSchema).optional(),
});
