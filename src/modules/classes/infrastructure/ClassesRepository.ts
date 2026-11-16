import { prisma } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
} from "../domain/dto/ClassGroupDTO";
import type { ClassesRepositoryInterface } from "../domain/interfaces/ClassesRepositoryInterface";

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
          username: updated.username,
          fullName: updated.fullName,
          classGroupId: updated.classGroupId,
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
}
