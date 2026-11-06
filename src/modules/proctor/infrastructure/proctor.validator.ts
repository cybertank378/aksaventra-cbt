import { z } from "zod";

export const getRoomParticipantsSchema = z.object({
  examId: z.string().min(1, "examId is required"),
  roomCode: z.string().optional(),
  status: z
    .enum(["IN_PROGRESS", "LOCKED", "SUBMITTED", "ABANDONED"])
    .optional(),
});

export const rotateRoomTokenSchema = z.object({
  manualToken: z.string().max(10).optional(),
  expiresInSeconds: z.coerce.number().int().positive().optional(),
});

export const proctorActionSchema = z.object({
  attemptId: z.string().min(1, "attemptId is required"),
  action: z.enum(["unlock", "reset_device", "extend_time", "force_submit"]),
  proctorId: z.string().optional(),
  reason: z.string().optional(),
  extendMinutes: z.coerce.number().positive().optional(),
});
