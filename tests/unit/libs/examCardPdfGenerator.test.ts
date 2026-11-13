import { describe, expect, it, vi } from "vitest";
import { generateExamCardsPdf } from "@/libs/examCardPdfGenerator";
import type { ExamCardItemDTO, ExamCardSettings } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";

// Mock jsPDF class constructor
vi.mock("jspdf", () => {
  return {
    default: class MockJsPDF {
      roundedRect = vi.fn();
      rect = vi.fn();
      line = vi.fn();
      circle = vi.fn();
      text = vi.fn();
      addImage = vi.fn();
      setFont = vi.fn();
      setFontSize = vi.fn();
      setTextColor = vi.fn();
      setDrawColor = vi.fn();
      setFillColor = vi.fn();
      setLineWidth = vi.fn();
      setLineDashPattern = vi.fn();
      getTextWidth = vi.fn().mockReturnValue(30);
      addPage = vi.fn();
      save = vi.fn();
      saveGraphicsState = vi.fn();
      restoreGraphicsState = vi.fn();
    },
  };
});

describe("ExamCardPdfGenerator & Settings", () => {
  const mockCards: ExamCardItemDTO[] = [
    {
      studentId: "std-1",
      nisn: "P72324001",
      fullName: "ACHMAD BAIHAQI",
      className: "VII.1",
      roomCode: "VII.1",
      seatNumber: "P72324001",
      examTitle: "ASESMEN SUMATIF AKHIR TAHUN",
      sessionTime: "07.00 - 09.00",
      verificationCode: "AKSA-9912-7711",
    },
    {
      studentId: "std-2",
      nisn: "P72324002",
      fullName: "SITI AMALIA",
      className: "VII.1",
      roomCode: "VII.1",
      seatNumber: "P72324002",
      examTitle: "ASESMEN SUMATIF AKHIR TAHUN",
      sessionTime: "07.00 - 09.00",
      verificationCode: "AKSA-8821-4422",
    },
  ];

  it("should provide valid default exam card settings matching official school card", () => {
    expect(DEFAULT_EXAM_CARD_SETTINGS.institutionName).toBe("SEKOLAH MENENGAH PERTAMA NEGERI 29");
    expect(DEFAULT_EXAM_CARD_SETTINGS.cardsPerPage).toBe(2);
    expect(DEFAULT_EXAM_CARD_SETTINGS.signerTitle).toBe("Kepala SMP Negeri 29 Jakarta,");
    expect(DEFAULT_EXAM_CARD_SETTINGS.signerName).toBe("Abdul Malik, M.Si");
    expect(DEFAULT_EXAM_CARD_SETTINGS.schedule.length).toBeGreaterThan(0);
  });

  it("should do nothing if cards array is empty", async () => {
    await expect(
      generateExamCardsPdf([], DEFAULT_EXAM_CARD_SETTINGS),
    ).resolves.toBeUndefined();
  });

  it("should generate PDF without errors with custom settings and cards", async () => {
    const customSettings: ExamCardSettings = {
      ...DEFAULT_EXAM_CARD_SETTINGS,
      institutionName: "SMP NEGERI 29 JAKARTA",
      cardsPerPage: 2,
    };

    await expect(
      generateExamCardsPdf(mockCards, customSettings, {
        filename: "Kartu_Peserta_VII_1.pdf",
      }),
    ).resolves.toBeUndefined();
  });
});
