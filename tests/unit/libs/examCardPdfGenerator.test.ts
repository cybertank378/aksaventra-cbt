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
    },
  };
});

describe("ExamCardPdfGenerator & Settings", () => {
  const mockCards: ExamCardItemDTO[] = [
    {
      studentId: "std-1",
      nisn: "0012345678",
      fullName: "Budi Pratama",
      className: "XII-MIPA-1",
      roomCode: "LAB-01",
      seatNumber: "M-01",
      examTitle: "Penilaian Akhir Semester (PAS) CBT",
      sessionTime: "07:30 - 09:30",
      verificationCode: "AKSA-9912-7711",
    },
    {
      studentId: "std-2",
      nisn: "0087654321",
      fullName: "Siti Rahma",
      className: "XII-MIPA-1",
      roomCode: "LAB-01",
      seatNumber: "M-02",
      examTitle: "Penilaian Akhir Semester (PAS) CBT",
      sessionTime: "07:30 - 09:30",
      verificationCode: "AKSA-8821-4422",
    },
  ];

  it("should provide valid default exam card settings", () => {
    expect(DEFAULT_EXAM_CARD_SETTINGS.institutionName).toBeDefined();
    expect(DEFAULT_EXAM_CARD_SETTINGS.cardsPerPage).toBe(4);
    expect(DEFAULT_EXAM_CARD_SETTINGS.city).toBe("Jakarta");
    expect(DEFAULT_EXAM_CARD_SETTINGS.signerTitle).toBe("Kepala Sekolah");
  });

  it("should do nothing if cards array is empty", async () => {
    await expect(
      generateExamCardsPdf([], DEFAULT_EXAM_CARD_SETTINGS),
    ).resolves.toBeUndefined();
  });

  it("should generate PDF without errors with custom settings and cards", async () => {
    const customSettings: ExamCardSettings = {
      ...DEFAULT_EXAM_CARD_SETTINGS,
      institutionName: "SMA LABSCHOOL JAKARTA",
      subHeader: "ASESMEN SUMATIF TAHAP 1",
      cardsPerPage: 2,
    };

    await expect(
      generateExamCardsPdf(mockCards, customSettings, {
        filename: "Kartu_Ujian_XII_MIPA_1.pdf",
      }),
    ).resolves.toBeUndefined();
  });
});
