import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";

export async function GET() {
  const subjectSet = new Set<string>();

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
