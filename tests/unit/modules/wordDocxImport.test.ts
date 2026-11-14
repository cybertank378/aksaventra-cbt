import { describe, expect, it } from "vitest";
import {
  QUESTION_IMPORT_HEADERS,
  normalizeWordQuestionType,
} from "@/libs/wordDocxUtils";

describe("WordDocxUtils Unit Tests", () => {
  it("should have standard 12 question import headers matching Moodle mod_cbt", () => {
    expect(QUESTION_IMPORT_HEADERS).toEqual([
      "nomor",
      "jenis_soal",
      "soal",
      "opsi_a",
      "opsi_b",
      "opsi_c",
      "opsi_d",
      "opsi_e",
      "kunci",
      "bobot",
      "toleransi",
      "pembahasan",
    ]);
  });

  describe("normalizeWordQuestionType", () => {
    it("identifies single choice when 4 options exist and 1 key is provided", () => {
      const type = normalizeWordQuestionType("Pilihan Ganda", 4, "A");
      expect(type).toBe("multichoice_single");
    });

    it("identifies MCMA when multiple keys are present separated by commas", () => {
      const type = normalizeWordQuestionType("Pilihan Ganda", 4, "A, C, D");
      expect(type).toBe("multichoice_multi");
    });

    it("identifies true/false when Benar or Salah is indicated", () => {
      const type = normalizeWordQuestionType("Benar / Salah", 2, "Benar");
      expect(type).toBe("truefalse");
    });

    it("identifies shortanswer when isian singkat is indicated", () => {
      const type = normalizeWordQuestionType("Isian Singkat", 0, "Fotosintesis");
      expect(type).toBe("shortanswer");
    });

    it("identifies numerical question when numerik is indicated", () => {
      const type = normalizeWordQuestionType("Numerik & Toleransi", 0, "3.14");
      expect(type).toBe("numerical");
    });

    it("identifies essay question when no options exist and type is essay", () => {
      const type = normalizeWordQuestionType("Uraian / Esai", 0, "");
      expect(type).toBe("essay");
    });
  });
});
