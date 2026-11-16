import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";

export async function GET() {
  const subjectSet = new Set<string>();

  try {
    const subjects = await prisma.subject.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });
    for (const s of subjects) {
      const name = s.name?.trim();
      if (name) subjectSet.add(name);
    }
  } catch {
    // Database might not be connected yet
  }

  try {
    const exams = await prisma.exam.findMany({
      select: { courseName: true },
      distinct: ["courseName"],
    });
    for (const exam of exams) {
      const name = exam.courseName?.trim();
      if (name) subjectSet.add(name);
    }
  } catch {
    // Database might not be connected yet; fallback gracefully to question bank subjects
  }

  try {
    const questionsRepo = new QuestionsRepository();
    const questions = await questionsRepo.findMany();
    for (const q of questions) {
      const name = q.subject?.trim();
      if (name) subjectSet.add(name);
    }
  } catch {
    // Ignore repository read error
  }

  const subjects = Array.from(subjectSet).sort((a, b) => a.localeCompare(b));
  return NextResponse.json({ success: true, data: subjects });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      shortName?: string;
      description?: string;
    };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_INPUT", message: "Nama mata pelajaran wajib diisi" },
        },
        { status: 400 },
      );
    }

    const subject = await prisma.subject.upsert({
      where: { name },
      create: {
        name,
        shortName: body.shortName?.trim() || null,
        description: body.description?.trim() || null,
      },
      update: {
        ...(body.shortName ? { shortName: body.shortName.trim() } : {}),
        ...(body.description ? { description: body.description.trim() } : {}),
      },
    });

    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushSubjectToMoodle({
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
        description: subject.description,
      });
    }

    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SUBJECT_CREATE_FAILED",
          message: err instanceof Error ? err.message : "Gagal membuat mata pelajaran",
        },
      },
      { status: 500 },
    );
  }
}
