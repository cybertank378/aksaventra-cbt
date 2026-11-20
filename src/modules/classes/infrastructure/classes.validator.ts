import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  code: z.string().optional(),
  description: z.string().optional(),
  studentIds: z.array(z.string().min(1)).optional(),
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
  seatNumber: z.string().optional(),
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
  studentIds: z.array(z.string().min(1)).optional(),
});

export const batchImportClassesSchema = z.object({
  csvText: z.string().min(1, "Konten berkas CSV kelas tidak boleh kosong"),
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
  seatNumber: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bulkAssignRoomSeatsSchema = z.object({
  assignments: z
    .array(
      z.object({
        studentId: z.string().min(1),
        roomCode: z.string().min(1),
        seatNumber: z.string().min(1),
      }),
    )
    .min(1, "Minimal 1 penempatan meja siswa diperlukan"),
  examId: z.string().nullable().optional(),
});

export const bulkAssignStudentClassSchema = z.object({
  studentIds: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal 1 siswa terlebih dahulu"),
  classGroupId: z.string().nullable(),
});

export const batchImportStudentsSchema = z.object({
  csvText: z.string().min(1, "Konten berkas CSV/Excel tidak boleh kosong"),
  defaultClassGroupId: z.string().nullable().optional(),
  subjectId: z.string().nullable().optional(),
  courseName: z.string().nullable().optional(),
  examId: z.string().nullable().optional(),
  roomCode: z.string().optional(),
  seatPrefix: z.string().optional(),
});

export const enrollStudentsSchema = z
  .object({
    studentIds: z.array(z.string().min(1)).optional(),
    classGroupIds: z.array(z.string().min(1)).optional(),
    subjectId: z.string().nullable().optional(),
    courseName: z.string().nullable().optional(),
    examId: z.string().nullable().optional(),
    roomCode: z.string().optional(),
    seatPrefix: z.string().optional(),
  })
  .refine(
    (d) =>
      (d.studentIds && d.studentIds.length > 0) ||
      (d.classGroupIds && d.classGroupIds.length > 0),
    { message: "Pilih minimal 1 siswa atau 1 kelas/cohort" },
  )
  .refine((d) => Boolean(d.subjectId || d.courseName?.trim() || d.examId), {
    message: "Pilih minimal 1 mata pelajaran (Course) atau ujian (Quiz/CBT)",
  });
