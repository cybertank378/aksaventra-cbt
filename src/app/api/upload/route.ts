import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export const instant = false;

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: { message: "Berkas gambar tidak ditemukan." } },
        { status: 400 },
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Format berkas tidak didukung. Harap unggah berkas gambar (JPG, PNG, WebP, GIF, SVG).",
          },
        },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Ukuran gambar terlalu besar. Maksimal 5 MB." },
        },
        { status: 400 },
      );
    }

    // Determine extension
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
    };
    const extension = extMap[file.type] || ".png";

    // Generate unique safe filename
    const uniqueName = `question_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${extension}`;

    // Target directory: public/uploads/questions
    const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    const publicUrl = `/uploads/questions/${uniqueName}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: uniqueName,
          size: file.size,
          type: file.type,
        },
      },
      { status: 201 },
    );
  } catch (_err) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Gagal memproses dan menyimpan berkas gambar." },
      },
      { status: 500 },
    );
  }
}
