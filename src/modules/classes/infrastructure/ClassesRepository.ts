import { prisma } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
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

  async deleteClass(id: string): Promise<boolean> {
    try {
      await prisma.classGroup.delete({
        where: { id },
      });
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
}
