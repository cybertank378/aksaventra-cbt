import { prisma } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  BatchImportStudentsInputDTO,
  BatchImportStudentsResultDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  EnrollStudentsInputDTO,
  EnrollStudentsResultDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
} from "../domain/dto/ClassGroupDTO";
import type { ClassesRepositoryInterface } from "../domain/interfaces/ClassesRepositoryInterface";

function parseCsvRecords(rawCsv: string): Array<Record<string, string>> {
  const cleaned = rawCsv.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const delimiter =
    (headerLine.match(/;/g)?.length ?? 0) >=
    (headerLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        out.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current.trim());
    return out;
  };

  const headers = splitLine(headerLine).map((h) =>
    h
      .toLowerCase()
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, "_"),
  );

  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    if (values.every((v) => v === "")) continue;
    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (key) {
        record[key] = (values[c] ?? "").replace(/^["']|["']$/g, "").trim();
      }
    }
    rows.push(record);
  }
  return rows;
}

export class ClassesRepository implements ClassesRepositoryInterface {
  async getAllClasses(): Promise<ClassGroupDTO[]> {
    const records = await prisma.classGroup.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return records.map((r) => ({
      id: r.id,
      moodleId: r.moodleId,
      name: r.name,
      code: r.code,
      description: r.description,
      studentCount: r._count.students,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async getClassById(
    id: string,
  ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null> {
    const record = await prisma.classGroup.findUnique({
      where: { id },
      include: {
        students: {
          orderBy: { username: "asc" },
        },
      },
    });

    if (!record) return null;

    return {
      id: record.id,
      moodleId: record.moodleId,
      name: record.name,
      code: record.code,
      description: record.description,
      studentCount: record.students.length,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      students: record.students.map((s) => ({
        id: s.id,
        username: s.username,
        fullName: s.fullName,
        className: s.className,
        classGroupId: s.classGroupId,
        roomCode: s.roomCode,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  }

  async createClass(data: CreateClassGroupInputDTO): Promise<ClassGroupDTO> {
    const created = await prisma.classGroup.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });

    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushClassToMoodle({
        id: created.id,
        name: created.name,
        code: created.code,
        description: created.description,
      });
    }

    return {
      id: created.id,
      moodleId: created.moodleId,
      name: created.name,
      code: created.code,
      description: created.description,
      studentCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updateClass(
    id: string,
    data: UpdateClassGroupInputDTO,
  ): Promise<ClassGroupDTO | null> {
    try {
      const updated = await prisma.classGroup.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
        },
        include: {
          _count: { select: { students: true } },
        },
      });

      if (data.name !== undefined) {
        await prisma.user.updateMany({
          where: { classGroupId: id },
          data: { className: data.name },
        });
      }

      if (process.env.NODE_ENV !== "test") {
        void moodleSyncService.pushClassToMoodle({
          id: updated.id,
          moodleId: updated.moodleId,
          name: updated.name,
          code: updated.code,
          description: updated.description,
        });
      }

      return {
        id: updated.id,
        moodleId: updated.moodleId,
        name: updated.name,
        code: updated.code,
        description: updated.description,
        studentCount: updated._count.students,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteClass(id: string): Promise<boolean> {
    try {
      const existing = await prisma.classGroup.findUnique({
        where: { id },
        select: { moodleId: true },
      });
      await prisma.user.updateMany({
        where: { classGroupId: id },
        data: { classGroupId: null, className: null },
      });
      await prisma.classGroup.delete({
        where: { id },
      });
      if (process.env.NODE_ENV !== "test" && existing?.moodleId) {
        void moodleSyncService.deleteEntityInMoodle(
          "cohort",
          existing.moodleId,
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  async getAllStudents(classGroupId?: string): Promise<StudentDTO[]> {
    const records = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(classGroupId ? { classGroupId } : {}),
      },
      orderBy: { username: "asc" },
    });

    return records.map((s) => ({
      id: s.id,
      username: s.username,
      fullName: s.fullName,
      className: s.className,
      classGroupId: s.classGroupId,
      roomCode: s.roomCode,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async createStudent(data: CreateStudentInputDTO): Promise<StudentDTO> {
    const created = await prisma.user.create({
      data: {
        username: data.username,
        fullName: data.fullName,
        passwordHash: data.password || "Siswa123*",
        role: "STUDENT",
        className: data.className,
        classGroupId: data.classGroupId,
        roomCode: data.roomCode || "LAB-01",
      },
    });

    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushStudentToMoodle({
        id: created.id,
        username: created.username,
        fullName: created.fullName,
        password: data.password,
        classGroupId: created.classGroupId,
      });
    }

    return {
      id: created.id,
      username: created.username,
      fullName: created.fullName,
      className: created.className,
      classGroupId: created.classGroupId,
      roomCode: created.roomCode,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async assignStudentToClass(
    studentId: string,
    classGroupId: string,
    className?: string,
  ): Promise<boolean> {
    try {
      const updated = await prisma.user.update({
        where: { id: studentId },
        data: {
          classGroupId,
          ...(className ? { className } : {}),
        },
      });
      if (process.env.NODE_ENV !== "test") {
        void moodleSyncService.pushStudentToMoodle({
          id: updated.id,
          moodleUserId: updated.moodleUserId,
          username: updated.username,
          fullName: updated.fullName,
          classGroupId: updated.classGroupId,
          isActive: updated.isActive,
          replaceCohort: true,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async getStudentById(id: string): Promise<StudentDTO | null> {
    const s = await prisma.user.findUnique({
      where: { id },
    });
    if (!s || s.role !== "STUDENT") return null;

    return {
      id: s.id,
      username: s.username,
      fullName: s.fullName,
      className: s.className,
      classGroupId: s.classGroupId,
      roomCode: s.roomCode,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
    };
  }

  async updateStudent(
    id: string,
    data: UpdateStudentInputDTO,
  ): Promise<StudentDTO | null> {
    try {
      let resolvedClassName = data.className;
      if (data.classGroupId !== undefined) {
        if (data.classGroupId) {
          const cls = await prisma.classGroup.findUnique({
            where: { id: data.classGroupId },
            select: { name: true },
          });
          if (cls) {
            resolvedClassName = cls.name;
          }
        } else {
          resolvedClassName = null;
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(data.username !== undefined ? { username: data.username } : {}),
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.password && data.password.trim() !== ""
            ? { passwordHash: data.password.trim() }
            : {}),
          ...(data.classGroupId !== undefined
            ? { classGroupId: data.classGroupId }
            : {}),
          ...(resolvedClassName !== undefined
            ? { className: resolvedClassName }
            : {}),
          ...(data.roomCode !== undefined ? { roomCode: data.roomCode } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });

      if (process.env.NODE_ENV !== "test") {
        void moodleSyncService.pushStudentToMoodle({
          id: updated.id,
          moodleUserId: updated.moodleUserId,
          username: updated.username,
          fullName: updated.fullName,
          password: data.password,
          classGroupId: updated.classGroupId,
          isActive: updated.isActive,
          replaceCohort: true,
        });
      }

      return {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        className: updated.className,
        classGroupId: updated.classGroupId,
        roomCode: updated.roomCode,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      const existing = await prisma.user.findUnique({
        where: { id },
        select: { moodleUserId: true },
      });
      await prisma.user.delete({ where: { id } });
      if (process.env.NODE_ENV !== "test" && existing?.moodleUserId) {
        void moodleSyncService.deleteEntityInMoodle(
          "user",
          existing.moodleUserId,
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  async bulkAssignStudentsToClass(
    studentIds: string[],
    classGroupId: string | null,
  ): Promise<number> {
    if (studentIds.length === 0) return 0;

    let className: string | null = null;
    if (classGroupId) {
      const cls = await prisma.classGroup.findUnique({
        where: { id: classGroupId },
        select: { name: true },
      });
      className = cls?.name ?? null;
    }

    const res = await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        role: "STUDENT",
      },
      data: {
        classGroupId,
        className,
      },
    });

    if (process.env.NODE_ENV !== "test" && res.count > 0) {
      const updatedUsers = await prisma.user.findMany({
        where: { id: { in: studentIds } },
      });
      await Promise.allSettled(
        updatedUsers.map((u) =>
          moodleSyncService.pushStudentToMoodle({
            id: u.id,
            moodleUserId: u.moodleUserId,
            username: u.username,
            fullName: u.fullName,
            classGroupId: u.classGroupId,
            isActive: u.isActive,
            replaceCohort: true,
          }),
        ),
      );
    }

    return res.count;
  }

  async batchImportStudents(
    input: BatchImportStudentsInputDTO,
  ): Promise<BatchImportStudentsResultDTO> {
    const rows = parseCsvRecords(input.csvText);
    const errors: string[] = [];
    if (rows.length === 0) {
      return {
        processedCount: 0,
        createdClasses: 0,
        enrolledCount: 0,
        moodleSyncedCount: 0,
        errors: ["Berkas CSV/Excel kosong atau header tidak valid."],
      };
    }

    let defaultClass: { id: string; name: string } | null = null;
    if (input.defaultClassGroupId) {
      defaultClass = await prisma.classGroup.findUnique({
        where: { id: input.defaultClassGroupId },
        select: { id: true, name: true },
      });
    }

    const classCache = new Map<string, { id: string; name: string }>();
    let createdClasses = 0;
    let processedCount = 0;
    let moodleSyncedCount = 0;
    const importedStudentIds: string[] = [];
    const courseEnrollGroups = new Map<string, string[]>();

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const username = (row.nis_username || row.username || row.nis || "")
        .trim()
        .toLowerCase();
      const firstNameCol = (row.firstname || "").trim();
      const lastNameCol = (row.lastname || "").trim();
      const fullName = (
        row.nama_lengkap ||
        row.name ||
        row.nama ||
        `${firstNameCol} ${lastNameCol}`.trim()
      ).trim();
      const password = (row.password || "").trim();
      const cohortLabel = (
        row.cohort ||
        row.cohort1 ||
        row.cohort_idnumber ||
        row.kelas ||
        row.class ||
        ""
      ).trim();
      const rowCourse = (
        row.course1 ||
        row.course ||
        row.mata_pelajaran ||
        row.mapel ||
        ""
      ).trim();
      const roomCode = (
        row.ruang_ujian ||
        row.ruangan ||
        input.roomCode ||
        "LAB-01"
      ).trim();

      if (!username || !fullName) {
        errors.push(
          `Baris ${idx + 2}: Username/NIS dan Nama Lengkap wajib diisi.`,
        );
        continue;
      }

      try {
        let targetClass: { id: string; name: string } | null = defaultClass;
        if (cohortLabel) {
          const cacheKey = cohortLabel.toLowerCase();
          const cached = classCache.get(cacheKey);
          if (cached) {
            targetClass = cached;
          } else {
            const existingClass = await prisma.classGroup.findFirst({
              where: {
                OR: [{ name: cohortLabel }, { code: cohortLabel }],
              },
              select: { id: true, name: true, moodleId: true },
            });
            if (existingClass) {
              targetClass = { id: existingClass.id, name: existingClass.name };
            } else {
              const created = await prisma.classGroup.create({
                data: {
                  name: cohortLabel,
                  code: cohortLabel.replace(/\s+/g, "-").toUpperCase(),
                },
              });
              createdClasses++;
              targetClass = { id: created.id, name: created.name };
              if (process.env.NODE_ENV !== "test") {
                await moodleSyncService.pushClassToMoodle({
                  id: created.id,
                  name: created.name,
                  code: created.code,
                  description: created.description,
                });
              }
            }
            classCache.set(cacheKey, targetClass);
          }
        }

        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        let savedUser: {
          id: string;
          moodleUserId: number | null;
          username: string;
          fullName: string;
          classGroupId: string | null;
          isActive: boolean;
        };

        if (existingUser) {
          savedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              fullName,
              ...(password ? { passwordHash: password } : {}),
              ...(targetClass
                ? {
                    classGroupId: targetClass.id,
                    className: targetClass.name,
                  }
                : {}),
              roomCode,
              isActive: true,
            },
          });
        } else {
          savedUser = await prisma.user.create({
            data: {
              username,
              fullName,
              passwordHash: password || username || "Siswa123*",
              role: "STUDENT",
              classGroupId: targetClass?.id ?? null,
              className: targetClass?.name ?? null,
              roomCode,
              isActive: true,
            },
          });
        }

        importedStudentIds.push(savedUser.id);
        processedCount++;

        if (rowCourse) {
          const list = courseEnrollGroups.get(rowCourse) ?? [];
          list.push(savedUser.id);
          courseEnrollGroups.set(rowCourse, list);
        }

        if (process.env.NODE_ENV !== "test") {
          const syncRes = await moodleSyncService.pushStudentToMoodle({
            id: savedUser.id,
            moodleUserId: savedUser.moodleUserId,
            username: savedUser.username,
            fullName: savedUser.fullName,
            password: password || undefined,
            classGroupId: savedUser.classGroupId,
            isActive: savedUser.isActive,
            replaceCohort: Boolean(targetClass),
          });
          if (syncRes.synced) {
            moodleSyncedCount++;
          }
        }
      } catch (err) {
        errors.push(
          `Baris ${idx + 2} (${username}): ${err instanceof Error ? err.message : "Gagal menyimpan siswa"}`,
        );
      }
    }

    let enrolledCount = 0;

    // Enroll all imported students into explicitly chosen Course / Exam
    if (
      importedStudentIds.length > 0 &&
      (input.subjectId || input.courseName || input.examId)
    ) {
      const enrolRes = await this.enrollStudents({
        studentIds: importedStudentIds,
        subjectId: input.subjectId,
        courseName: input.courseName,
        examId: input.examId,
        roomCode: input.roomCode,
        seatPrefix: input.seatPrefix,
      });
      enrolledCount += enrolRes.enrolledCount;
    }

    // Enroll per-row course1 / course columns if present in CSV
    for (const [rowCourseName, studentIds] of courseEnrollGroups.entries()) {
      if (rowCourseName === input.courseName) continue;
      const enrolRes = await this.enrollStudents({
        studentIds,
        courseName: rowCourseName,
        roomCode: input.roomCode,
        seatPrefix: input.seatPrefix,
      });
      enrolledCount += enrolRes.enrolledCount;
    }

    return {
      processedCount,
      createdClasses,
      enrolledCount,
      moodleSyncedCount,
      errors,
    };
  }

  async enrollStudents(
    input: EnrollStudentsInputDTO,
  ): Promise<EnrollStudentsResultDTO> {
    const roomCode = input.roomCode?.trim() || "LAB-01";
    const seatPrefix = input.seatPrefix?.trim() || "M";

    let targetCourseName = input.courseName?.trim() || null;
    let targetMoodleCourseId: number | null = null;
    let targetExam: {
      id: string;
      moodleCbtId: number;
      title: string;
      courseName: string;
    } | null = null;

    if (input.subjectId) {
      const sub = await prisma.subject
        .findUnique({
          where: { id: input.subjectId },
          select: { name: true, moodleCourseId: true },
        })
        .catch(() => null);
      if (sub) {
        targetCourseName = sub.name;
        targetMoodleCourseId = sub.moodleCourseId;
      }
    }

    if (input.examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: input.examId },
        select: { id: true, moodleCbtId: true, title: true, courseName: true },
      });
      if (exam) {
        targetExam = exam;
        if (!targetCourseName) {
          targetCourseName = exam.courseName;
        }
      }
    }

    const studentWhereConditions: Array<Record<string, unknown>> = [];
    if (input.studentIds && input.studentIds.length > 0) {
      studentWhereConditions.push({ id: { in: input.studentIds } });
    }
    if (input.classGroupIds && input.classGroupIds.length > 0) {
      studentWhereConditions.push({
        classGroupId: { in: input.classGroupIds },
      });
    }

    if (studentWhereConditions.length === 0) {
      return {
        enrolledCount: 0,
        moodleSynced: false,
        courseName: targetCourseName,
        examTitle: targetExam?.title ?? null,
      };
    }

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: studentWhereConditions,
      },
      orderBy: [{ className: "asc" }, { username: "asc" }],
    });

    if (targetExam) {
      for (const s of students) {
        const existingAttempt = await prisma.attempt.findUnique({
          where: {
            examId_userId: {
              examId: targetExam.id,
              userId: s.id,
            },
          },
        });
        if (!existingAttempt) {
          await prisma.attempt.create({
            data: {
              examId: targetExam.id,
              userId: s.id,
              status: "IN_PROGRESS",
              deviceHash: "unbound",
              ipAddress: "0.0.0.0",
              questionOrder: [],
              answersJson: {},
            },
          });
        }
      }
    }

    let moodleSynced = false;
    if (process.env.NODE_ENV !== "test" && students.length > 0) {
      const cohortMoodleIds: number[] = [];
      if (input.classGroupIds && input.classGroupIds.length > 0) {
        const classes = await prisma.classGroup.findMany({
          where: { id: { in: input.classGroupIds } },
          select: { moodleId: true },
        });
        for (const c of classes) {
          if (c.moodleId && c.moodleId > 0) {
            cohortMoodleIds.push(c.moodleId);
          }
        }
      }

      const userMoodleIds: number[] = [];
      for (const s of students) {
        if (s.moodleUserId && s.moodleUserId > 0) {
          userMoodleIds.push(s.moodleUserId);
        } else {
          const pushed = await moodleSyncService.pushStudentToMoodle({
            id: s.id,
            username: s.username,
            fullName: s.fullName,
            classGroupId: s.classGroupId,
            isActive: s.isActive,
          });
          if (pushed.moodleId && pushed.moodleId > 0) {
            userMoodleIds.push(pushed.moodleId);
          }
        }
      }

      const enrolRes = await moodleSyncService.enrollStudentsInMoodle({
        courseName: targetCourseName,
        moodleCourseId: targetMoodleCourseId,
        moodleCbtId: targetExam?.moodleCbtId ?? null,
        cohortMoodleIds,
        userMoodleIds,
        roomCode,
        seatPrefix,
      });
      moodleSynced = enrolRes.synced;
    }

    return {
      enrolledCount: students.length,
      moodleSynced,
      courseName: targetCourseName,
      examTitle: targetExam?.title ?? null,
    };
  }
}
