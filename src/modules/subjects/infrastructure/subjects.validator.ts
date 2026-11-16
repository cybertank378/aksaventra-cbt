import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Nama mata pelajaran wajib diisi"),
  shortName: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1, "Nama mata pelajaran wajib diisi").optional(),
  shortName: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
});
