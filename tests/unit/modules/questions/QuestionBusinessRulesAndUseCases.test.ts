import { describe, expect, it } from "vitest";
import { CreateQuestionUseCase } from "@/modules/questions/application/usecases/CreateQuestionUseCase";
import { ManageQuestionsUseCase } from "@/modules/questions/application/usecases/ManageQuestionsUseCase";
import {
  QuestionBusinessRules,
  QuestionValidationError,
} from "@/modules/questions/domain/rules/QuestionBusinessRules";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";

describe("QuestionBusinessRules Domain Logic", () => {
  it("should throw error if multichoice does not have exactly 1 correct answer", () => {
    expect(() =>
      QuestionBusinessRules.validate({
        subject: "Matematika",
        gradeLevel: "X",
        type: "multichoice",
        stem: "Berapakah 2 + 2?",
        points: 2,
        options: [
          { id: "1", label: "A", text: "3", isCorrect: false },
          { id: "2", label: "B", text: "4", isCorrect: false },
        ],
      }),
    ).toThrow(QuestionValidationError);
  });

  it("should throw error if points are zero or negative", () => {
    expect(() =>
      QuestionBusinessRules.validate({
        subject: "Fisika",
        gradeLevel: "X",
        type: "multichoice",
        stem: "Pertanyaan fisika standar",
        points: 0,
        options: [
          { id: "1", label: "A", text: "Opsi A", isCorrect: true },
          { id: "2", label: "B", text: "Opsi B", isCorrect: false },
        ],
      }),
    ).toThrow("Bobot poin soal harus berupa angka positif lebih besar dari 0.");
  });

  it("should throw error if stem text contains dangerous scripts", () => {
    expect(() =>
      QuestionBusinessRules.validate({
        subject: "Kimia",
        gradeLevel: "XI",
        type: "essay",
        stem: "Jelaskan proses <script>alert('xss')</script>",
        points: 5,
        options: [],
      }),
    ).toThrow("Teks pertanyaan mengandung tag atau skrip yang dilarang");
  });

  it("should pass validation for valid MCMA question", () => {
    expect(() =>
      QuestionBusinessRules.validate({
        subject: "Biologi",
        gradeLevel: "XII",
        type: "mcma",
        stem: "Pilihlah organel yang bermembran ganda!",
        points: 4,
        options: [
          { id: "1", label: "A", text: "Mitokondria", isCorrect: true },
          { id: "2", label: "B", text: "Kloroplas", isCorrect: true },
          { id: "3", label: "C", text: "Ribosom", isCorrect: false },
        ],
      }),
    ).not.toThrow();
  });
});

describe("Questions UseCases with Business Process", () => {
  it("CreateQuestionUseCase should normalize options and persist valid question", async () => {
    const repo = new QuestionsRepository();
    const useCase = new CreateQuestionUseCase(repo);

    const question = await useCase.execute({
      subject: "  Matematika  ",
      gradeLevel: "  XII ",
      type: "multichoice",
      stem: "  Tentukan nilai limit $\\lim_{x \\to 0} \\frac{\\sin x}{x}$!  ",
      points: 2.5,
      options: [
        { id: "1", label: " A ", text: " 1 ", isCorrect: true },
        { id: "2", label: " B ", text: " 0 ", isCorrect: false },
      ],
    });

    expect(question.subject).toBe("Matematika");
    expect(question.gradeLevel).toBe("XII");
    expect(question.options[0]?.text).toBe("1");
    expect(question.options[0]?.label).toBe("A");
  });

  it("ManageQuestionsUseCase.updateQuestion should enforce business rules on update", async () => {
    const repo = new QuestionsRepository();
    const createUseCase = new CreateQuestionUseCase(repo);
    const manageUseCase = new ManageQuestionsUseCase(repo);

    const created = await createUseCase.execute({
      subject: "Fisika",
      gradeLevel: "X",
      type: "multichoice",
      stem: "Pertanyaan fisika awal",
      points: 2.5,
      options: [
        { id: "1", label: "A", text: "Opsi Benar", isCorrect: true },
        { id: "2", label: "B", text: "Opsi Salah", isCorrect: false },
      ],
    });

    // Valid update
    const updated = await manageUseCase.updateQuestion(created.id, {
      stem: "Pertanyaan fisika terbarukan",
      points: 3.0,
    });

    expect(updated).not.toBeNull();
    expect(updated?.stem).toBe("Pertanyaan fisika terbarukan");
    expect(updated?.points).toBe(3.0);

    // Invalid update violating single correct answer rule
    await expect(
      manageUseCase.updateQuestion(created.id, {
        options: [
          { id: "1", label: "A", text: "Opsi A", isCorrect: false },
          { id: "2", label: "B", text: "Opsi B", isCorrect: false },
        ],
      }),
    ).rejects.toThrow("tepat 1 kunci jawaban yang benar");
  });
});

