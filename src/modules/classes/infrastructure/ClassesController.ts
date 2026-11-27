import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { requireRequestRole } from "@/security/serverAuth";
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

const CLASS_MANAGER_ROLES = ["ADMIN", "TEACHER"] as const;

export class ClassesController extends BaseController {
  constructor(private readonly classesService: ClassesService) {
    super();
  }

  private async authorizeManager(
    request?: NextRequest,
  ): Promise<NextResponse | null> {
    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Autentikasi diperlukan untuk mengakses endpoint ini.",
          },
        },
        { status: 401 },
      );
    }
    const { errorResponse } = await requireRequestRole(
      request,
      CLASS_MANAGER_ROLES,
    );
    return errorResponse;
  }

  private serverError(
    action: string,
    err: unknown,
    fallbackMessage: string,
  ): NextResponse {
    console.error(`[ClassesController.${action}]`, err);
    return NextResponse.json(
      { success: false, error: { message: fallbackMessage } },
      { status: 500 },
    );
  }

  public async getAllClasses(request?: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

    try {
      const classes = await this.classesService.getAllClasses();
      return NextResponse.json({ success: true, data: classes });
    } catch (err: unknown) {
      return this.serverError(
        "getAllClasses",
        err,
        "Gagal mengambil daftar kelas",
      );
    }
  }

  public async getClassById(
    id: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "getClassById",
        err,
        "Gagal mengambil detail kelas",
      );
    }
  }

  public async createClass(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError("createClass", err, "Gagal membuat kelas baru");
    }
  }

  public async updateClass(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "updateClass",
        err,
        "Gagal memperbarui data kelas",
      );
    }
  }

  public async deleteClass(
    id: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError("deleteClass", err, "Gagal menghapus kelas");
    }
  }

  public async getAllStudents(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

    try {
      const classGroupId =
        request.nextUrl.searchParams.get("classGroupId") || undefined;
      const students = await this.classesService.getAllStudents(classGroupId);
      return NextResponse.json({ success: true, data: students });
    } catch (err: unknown) {
      return this.serverError(
        "getAllStudents",
        err,
        "Gagal mengambil data siswa",
      );
    }
  }

  public async createStudent(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError("createStudent", err, "Gagal membuat akun siswa");
    }
  }

  public async assignStudent(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "assignStudent",
        err,
        "Gagal menetapkan siswa ke kelas",
      );
    }
  }

  public async getStudentById(
    id: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "getStudentById",
        err,
        "Gagal mengambil detail siswa",
      );
    }
  }

  public async updateStudent(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "updateStudent",
        err,
        "Gagal memperbarui data siswa",
      );
    }
  }

  public async deleteStudent(
    id: string,
    request?: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "deleteStudent",
        err,
        "Gagal menghapus data siswa",
      );
    }
  }

  public async bulkAssignStudents(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "bulkAssignStudents",
        err,
        "Gagal mengelompokkan siswa ke kelas",
      );
    }
  }

  public async importStudents(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "importStudents",
        err,
        "Gagal melakukan batch upload siswa",
      );
    }
  }

  public async enrollStudents(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "enrollStudents",
        err,
        "Gagal melakukan enrollment siswa ke course/ujian",
      );
    }
  }

  public async batchImportClasses(request: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "batchImportClasses",
        err,
        "Gagal mengimpor data kelas",
      );
    }
  }

  public async exportClassesCsv(request?: NextRequest): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

    try {
      const csvData = await this.classesService.exportClassesCsv();
      return NextResponse.json({
        success: true,
        data: { csvData },
      });
    } catch (err: unknown) {
      return this.serverError(
        "exportClassesCsv",
        err,
        "Gagal mengekspor data kelas",
      );
    }
  }

  public async bulkAssignRoomAndSeats(
    request: NextRequest,
  ): Promise<NextResponse> {
    const authError = await this.authorizeManager(request);
    if (authError) return authError;

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
      return this.serverError(
        "bulkAssignRoomAndSeats",
        err,
        "Gagal menyimpan penempatan ruang & nomor meja",
      );
    }
  }
}
