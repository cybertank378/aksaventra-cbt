import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import type { ClassesService } from "../application/service/ClassesService";
import {
  assignStudentSchema,
  createClassSchema,
  createStudentSchema,
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
}
