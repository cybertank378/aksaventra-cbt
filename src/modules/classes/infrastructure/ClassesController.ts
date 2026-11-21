import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import type { ClassesService } from "../application/service/ClassesService";
import {
  assignStudentSchema,
  batchImportClassesSchema,
  batchImportStudentsSchema,
  bulkAssignRoomSeatsSchema,
  bulkAssignStudentClassSchema,
  createClassSchema,
  createStudentSchema,
  enrollStudentsSchema,
  updateClassSchema,
  updateStudentSchema,
} from "./classes.validator";

export class ClassesController extends BaseController {
  constructor(private readonly classesService: ClassesService) {
    super();
  }

  public async getAllClasses(): Promise<NextResponse> {
    try {
      const classes = await this.classesService.getAllClasses();
      return NextResponse.json({ success: true, data: classes });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengambil daftar kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async getClassById(id: string): Promise<NextResponse> {
    try {
      const classDetails = await this.classesService.getClassDetails(id);
      if (!classDetails) {
        return NextResponse.json(
          { success: false, error: { message: "Kelas tidak ditemukan" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: classDetails });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengambil detail kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async createClass(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = createClassSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi data kelas gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const created = await this.classesService.createClass(parsed.data);
      return NextResponse.json(
        { success: true, data: created },
        { status: 201 },
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal membuat kelas baru";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async updateClass(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = updateClassSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi pembaruan kelas gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const updated = await this.classesService.updateClass(id, parsed.data);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { message: "Kelas tidak ditemukan" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: updated });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui data kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async deleteClass(id: string): Promise<NextResponse> {
    try {
      const success = await this.classesService.deleteClass(id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: { message: "Gagal menghapus kelas" } },
          { status: 400 },
        );
      }
      return NextResponse.json({ success: true, data: { id } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async getAllStudents(request: NextRequest): Promise<NextResponse> {
    try {
      const classGroupId =
        request.nextUrl.searchParams.get("classGroupId") || undefined;
      const students = await this.classesService.getAllStudents(classGroupId);
      return NextResponse.json({ success: true, data: students });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengambil data siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async createStudent(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = createStudentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi data siswa gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const created = await this.classesService.createStudent(parsed.data);
      return NextResponse.json(
        { success: true, data: created },
        { status: 201 },
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal membuat akun siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async assignStudent(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = assignStudentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi assign siswa gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const success = await this.classesService.assignStudentToClass(
        parsed.data.studentId,
        parsed.data.classGroupId,
        parsed.data.className,
      );

      return NextResponse.json({ success });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menetapkan siswa ke kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async getStudentById(id: string): Promise<NextResponse> {
    try {
      const student = await this.classesService.getStudentById(id);
      if (!student) {
        return NextResponse.json(
          { success: false, error: { message: "Siswa tidak ditemukan" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: student });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengambil detail siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async updateStudent(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = updateStudentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi pembaruan data siswa gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const updated = await this.classesService.updateStudent(id, {
        ...parsed.data,
        password: parsed.data.password || undefined,
      });
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { message: "Siswa tidak ditemukan" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: updated });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui data siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async deleteStudent(id: string): Promise<NextResponse> {
    try {
      const success = await this.classesService.deleteStudent(id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: { message: "Siswa tidak ditemukan" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: { id } });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus data siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async bulkAssignStudents(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = bulkAssignStudentClassSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi pengelompokan kelas gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const updatedCount = await this.classesService.bulkAssignStudentsToClass(
        parsed.data,
      );
      return NextResponse.json({
        success: true,
        data: { updatedCount },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengelompokkan siswa ke kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async importStudents(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = batchImportStudentsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validasi batch upload siswa gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const result = await this.classesService.batchImportStudents(parsed.data);
      return NextResponse.json({
        success: result.processedCount > 0,
        data: result,
        message:
          result.processedCount > 0
            ? `Berhasil mengimpor ${result.processedCount} siswa (${result.moodleSyncedCount} tersinkron ke Moodle).`
            : result.errors[0] ||
              "Tidak ada baris siswa yang berhasil diimpor.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal melakukan batch upload siswa";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async enrollStudents(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = enrollStudentsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                parsed.error.issues[0]?.message || "Validasi enrollment gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const result = await this.classesService.enrollStudents(parsed.data);
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal melakukan enrollment siswa ke course/ujian";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async batchImportClasses(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = batchImportClassesSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                parsed.error.issues[0]?.message ||
                "Validasi import CSV kelas gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const result = await this.classesService.batchImportClasses(parsed.data);
      return NextResponse.json({
        success: result.processedCount > 0,
        data: result,
        message:
          result.processedCount > 0
            ? `Berhasil mengimpor ${result.processedCount} kelas (${result.assignedStudentsCount} siswa dikelompokkan).`
            : result.errors[0] ||
              "Tidak ada baris kelas yang berhasil diimpor.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengimpor data kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async exportClassesCsv(): Promise<NextResponse> {
    try {
      const csvData = await this.classesService.exportClassesCsv();
      return NextResponse.json({
        success: true,
        data: { csvData },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengekspor data kelas";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }

  public async bulkAssignRoomAndSeats(
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parsed = bulkAssignRoomSeatsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                parsed.error.issues[0]?.message ||
                "Validasi penempatan ruang & nomor meja gagal",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const updatedCount = await this.classesService.bulkAssignRoomAndSeats(
        parsed.data,
      );
      return NextResponse.json({
        success: true,
        data: { updatedCount },
        message: `Berhasil menyimpan ruang & nomor meja untuk ${updatedCount} siswa.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan penempatan ruang & nomor meja";
      return NextResponse.json(
        { success: false, error: { message: msg } },
        { status: 500 },
      );
    }
  }
}
