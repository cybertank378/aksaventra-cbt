import { z } from "zod";

export const syncEntitySchema = z.enum([
  "user",
  "cohort",
  "cohort_member",
  "course",
  "cbt",
  "question",
  "all",
]);

export const syncActionSchema = z.enum([
  "created",
  "updated",
  "deleted",
  "added",
  "removed",
  "manual",
]);

export const moodleWebhookSchema = z.object({
  entity: syncEntitySchema,
  action: syncActionSchema,
  objectId: z.coerce.number().int().min(0).default(0),
  extra: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.coerce.number().optional(),
});

export const triggerSyncSchema = z.object({
  entity: syncEntitySchema.optional().default("all"),
});

export const syncManageSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("full"),
  }),
  z.object({
    mode: z.literal("pull"),
    entity: syncEntitySchema.optional().default("all"),
  }),
  z.object({
    mode: z.literal("push"),
    entity: z.enum([
      "class",
      "student",
      "subject",
      "course",
      "exam",
      "question",
    ]),
    id: z.string().min(1, "ID entitas wajib diisi"),
  }),
]);
