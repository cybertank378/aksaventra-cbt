import type {
  CBTQuestionType,
  CreateQuestionInputDTO,
  QuestionOptionDTO,
} from "../dto/QuestionDTO";

export class QuestionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuestionValidationError";
  }
}

/**
 * Domain Business Rules for CBT Question Bank.
 * Enforces question type constraints, scoring limits, and answer key validity.
 */
export class QuestionBusinessRules {
  /**
   * Validates all business constraints for a CBT question.
   * Throws QuestionValidationError if any business rule is violated.
   */
  public static validate(input: CreateQuestionInputDTO): void {
    this.validateStem(input.stem);
    this.validatePoints(input.points);
    this.validateTypeSpecificRules(input.type, input.options, input.tolerance);
  }

  /**
   * Stem / Question text validation
   */
  public static validateStem(stem: string): void {
    if (!stem || stem.trim().length < 3) {
      throw new QuestionValidationError(
        "Teks pertanyaan (stem) minimal harus terdiri dari 3 karakter.",
      );
    }

    // Security check: prohibit raw script or dangerous iframe execution
    const lower = stem.toLowerCase();
    if (
      lower.includes("<script") ||
      lower.includes("javascript:") ||
      lower.includes("<iframe")
    ) {
      throw new QuestionValidationError(
        "Teks pertanyaan mengandung tag atau skrip yang dilarang demi keamanan sistem CBT.",
      );
    }
  }

  /**
   * Scoring / Points policy validation
   */
  public static validatePoints(points: number): void {
    if (typeof points !== "number" || Number.isNaN(points) || points <= 0) {
      throw new QuestionValidationError(
        "Bobot poin soal harus berupa angka positif lebih besar dari 0.",
      );
    }

    if (points > 100) {
      throw new QuestionValidationError(
        "Bobot poin maksimal untuk satu butir soal adalah 100.",
      );
    }
  }

  /**
   * Type-specific answer key and option integrity rules
   */
  public static validateTypeSpecificRules(
    type: CBTQuestionType,
    options: QuestionOptionDTO[] = [],
    tolerance?: number,
  ): void {
    const validOptions = options.filter((o) => o.text && o.text.trim() !== "");
    const correctOptions = validOptions.filter((o) => o.isCorrect === true);

    switch (type) {
      case "multichoice": {
        if (validOptions.length < 2) {
          throw new QuestionValidationError(
            "Soal Pilihan Ganda biasa wajib memiliki minimal 2 opsi jawaban.",
          );
        }
        if (correctOptions.length !== 1) {
          throw new QuestionValidationError(
            "Soal Pilihan Ganda biasa wajib memiliki tepat 1 kunci jawaban yang benar.",
          );
        }
        break;
      }

      case "mcma": {
        if (validOptions.length < 2) {
          throw new QuestionValidationError(
            "Soal Pilihan Ganda Kompleks (MCMA) wajib memiliki minimal 2 opsi jawaban.",
          );
        }
        if (correctOptions.length < 1) {
          throw new QuestionValidationError(
            "Soal Pilihan Ganda Kompleks (MCMA) wajib memiliki minimal 1 kunci jawaban yang benar.",
          );
        }
        break;
      }

      case "truefalse": {
        if (validOptions.length !== 2) {
          throw new QuestionValidationError(
            "Soal Benar/Salah wajib memiliki tepat 2 opsi jawaban (Benar dan Salah).",
          );
        }
        if (correctOptions.length !== 1) {
          throw new QuestionValidationError(
            "Soal Benar/Salah wajib memiliki tepat 1 kunci jawaban yang benar.",
          );
        }
        break;
      }

      case "shortanswer": {
        if (validOptions.length < 1) {
          throw new QuestionValidationError(
            "Soal Isian Singkat wajib memiliki minimal 1 target kunci jawaban yang dapat diterima.",
          );
        }
        break;
      }

      case "numerical": {
        if (validOptions.length < 1) {
          throw new QuestionValidationError(
            "Soal Numerik wajib memiliki minimal 1 target angka kunci jawaban.",
          );
        }
        const numericAnswer = Number(validOptions[0]?.text);
        if (Number.isNaN(numericAnswer)) {
          throw new QuestionValidationError(
            "Kunci jawaban soal numerik harus berupa angka yang valid.",
          );
        }
        if (tolerance !== undefined && tolerance < 0) {
          throw new QuestionValidationError(
            "Nilai toleransi numerik tidak boleh bernilai negatif.",
          );
        }
        break;
      }

      case "matching": {
        if (validOptions.length < 2) {
          throw new QuestionValidationError(
            "Soal Menjodohkan wajib memiliki minimal 2 pasang premis dan target.",
          );
        }
        const missingMatchTarget = validOptions.some(
          (o) => !o.matchTarget || o.matchTarget.trim() === "",
        );
        if (missingMatchTarget) {
          throw new QuestionValidationError(
            "Setiap premis pada soal menjodohkan wajib dipasangkan dengan target yang sesuai.",
          );
        }
        break;
      }

      case "cloze": {
        if (validOptions.length < 1) {
          throw new QuestionValidationError(
            "Soal Teks Rumpang (Cloze) wajib mendefinisikan kunci isian rumpang.",
          );
        }
        break;
      }

      case "essay": {
        // Essay does not require options, grading is manual or rubric based
        break;
      }

      default: {
        throw new QuestionValidationError(`Tipe soal '${type}' tidak didukung.`);
      }
    }
  }

  /**
   * Generates a systematic, human-readable CBT Question Code
   */
  public static generateCode(subject: string, type: CBTQuestionType): string {
    const cleanSubject = subject.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "GEN";
    const typeMap: Record<CBTQuestionType, string> = {
      multichoice: "MC",
      mcma: "MCMA",
      truefalse: "TF",
      shortanswer: "SA",
      numerical: "NUM",
      matching: "MAT",
      cloze: "CLZ",
      essay: "ESY",
    };
    const cleanType = typeMap[type] || "Q";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${cleanSubject}-${cleanType}-${randomSuffix}`;
  }
}

