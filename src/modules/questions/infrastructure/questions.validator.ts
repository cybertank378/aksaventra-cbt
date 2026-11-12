import { z } from "zod";

export const cbtQuestionTypeEnum = z.enum([
  "multichoice",
  "mcma",
  "truefalse",
  "shortanswer",
  "numerical",
  "matching",
  "cloze",
  "essay",
]);

export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean().optional(),
  matchTarget: z.string().optional(),
});

export const createQuestionSchema = z.object({
  subject: z.string().min(1, "Mata pelajaran wajib diisi"),
  gradeLevel: z.string().min(1, "Tingkat kelas wajib diisi"),
  type: cbtQuestionTypeEnum,
  stem: z.string().min(3, "Stem / Teks soal minimal 3 karakter"),
  points: z.coerce.number().positive("Bobot poin harus lebih dari 0"),
  tolerance: z.coerce.number().optional(),
  options: z.array(questionOptionSchema).default([]),
  explanation: z.string().optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const questionsFilterSchema = z.object({
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  type: cbtQuestionTypeEnum.optional(),
  search: z.string().optional(),
});
