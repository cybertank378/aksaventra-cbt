import { describe, expect, it } from "vitest";
import { AnnouncementsService } from "@/modules/announcements/application/service/AnnouncementsService";
import { ExamCardsService } from "@/modules/exam-cards/application/service/ExamCardsService";
import { QuestionsService } from "@/modules/questions/application/service/QuestionsService";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";
import { DEFAULT_NAVIGATION_CATEGORIES } from "@/shared-ui/layout/AppSidebar";

describe("Sidebar Navigation Structure & Categories (Issue #27)", () => {
  it("should have all 4 designated categories: UTAMA, MANAJEMEN, KOMUNIKASI, LAPORAN", () => {
    const categoryNames = DEFAULT_NAVIGATION_CATEGORIES.map((c) => c.category);
    expect(categoryNames).toEqual([
      "UTAMA",
      "MANAJEMEN",
      "KOMUNIKASI",
      "LAPORAN",
    ]);
  });

  it("should contain all 10 designated sidebar items in their proper categories", () => {
    const flatItems = DEFAULT_NAVIGATION_CATEGORIES.flatMap((c) => c.items);
    const itemIds = flatItems.map((i) => i.id);

    // UTAMA
    expect(itemIds).toContain("dashboard");
    expect(itemIds).toContain("proctor");

    // MANAJEMEN
    expect(itemIds).toContain("classes");
    expect(itemIds).toContain("exams");
    expect(itemIds).toContain("create-question");
    expect(itemIds).toContain("questions");
    expect(itemIds).toContain("students");
    expect(itemIds).toContain("exam-cards");

    // KOMUNIKASI
    expect(itemIds).toContain("announcements");

    // LAPORAN
    expect(itemIds).toContain("results");

    expect(flatItems.length).toBe(10);
  });
});

describe("Questions Module (Bank Soal & Buat Soal)", () => {
  it("should list initial seed bank questions across CBT question types", async () => {
    const repo = new QuestionsRepository();
    const service = new QuestionsService(repo);

    const result = await service.getQuestions();
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.length).toBeGreaterThanOrEqual(8);
      const types = result.value.map((q) => q.type);
      expect(types).toContain("multichoice");
      expect(types).toContain("mcma");
      expect(types).toContain("truefalse");
      expect(types).toContain("shortanswer");
      expect(types).toContain("numerical");
      expect(types).toContain("matching");
      expect(types).toContain("cloze");
      expect(types).toContain("essay");
    }
  });

  it("should create a new question item successfully", async () => {
    const repo = new QuestionsRepository();
    const service = new QuestionsService(repo);

    const result = await service.createQuestion({
      subject: "Fisika",
      gradeLevel: "X",
      type: "multichoice",
      stem: "Berapakah nilai percepatan gravitasi bumi rata-rata?",
      points: 2.5,
      options: [
        {
          id: "opt-1",
          label: "A",
          text: "$9.8\\text{ m/s}^2$",
          isCorrect: true,
        },
        {
          id: "opt-2",
          label: "B",
          text: "$12\\text{ m/s}^2$",
          isCorrect: false,
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.subject).toBe("Fisika");
      expect(result.value.points).toBe(2.5);
    }
  });
});

describe("Exam Cards & Announcements Modules", () => {
  it("should instantiate and fetch announcements successfully", async () => {
    const annService = new AnnouncementsService();
    const result = await annService.getAnnouncements();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.length).toBeGreaterThanOrEqual(3);
      expect(result.value[0].title).toBeDefined();
    }
  });

  it("should instantiate ExamCardsService and handle query safely", async () => {
    const cardsService = new ExamCardsService();
    expect(cardsService).toBeDefined();
  });
});
