import type { AnswerValue } from "../dto/SyncBatchDTO";

export type NormalizedQuestionType =
  | "multichoice"
  | "mcma"
  | "truefalse"
  | "shortanswer"
  | "numerical"
  | "matching"
  | "cloze"
  | "essay";

export interface ScoreCalculationOptions {
  tolerance?: number | null;
}

export interface QuestionScoreMeta {
  type?: string;
  weight?: number;
  points?: number;
  tolerance?: number | null;
  key: unknown;
}

export interface QuestionScoreDetail {
  questionId: string;
  type: string;
  weight: number;
  fraction: number;
  score: number;
  requiresManualGrading: boolean;
}

export interface ExamScoreResult {
  finalScore: number;
  rawScore: number;
  maxRawScore: number;
  requiresManualGrading: boolean;
  details: Record<string, QuestionScoreDetail>;
}

const TRUE_VALUES = new Set(["1", "true", "t", "benar", "ya"]);
const FALSE_VALUES = new Set(["0", "false", "f", "salah", "tidak"]);

function parseNumeric(val: unknown): number | null {
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : null;
  }
  if (typeof val !== "string") {
    return null;
  }
  let clean = val.trim();
  if (clean === "") return null;
  if (clean.includes(",") && !clean.includes(".")) {
    clean = clean.replace(",", ".");
  }
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBoolean(val: unknown): boolean | null {
  if (typeof val === "boolean") return val;
  const s = String(val ?? "")
    .trim()
    .toLowerCase();
  if (TRUE_VALUES.has(s)) return true;
  if (FALSE_VALUES.has(s)) return false;
  return null;
}

function toStringList(val: unknown, upperCase = false): string[] {
  let raw: unknown[];
  if (Array.isArray(val)) {
    raw = val;
  } else if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        raw = Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        raw = trimmed.split(",");
      }
    } else if (trimmed.includes(",")) {
      raw = trimmed.split(",");
    } else {
      raw = [trimmed];
    }
  } else if (val === null || val === undefined) {
    return [];
  } else {
    raw = [val];
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const s = String(item ?? "").trim();
    if (!s) continue;
    const normalized = upperCase ? s.toUpperCase() : s;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
}

function toRecordMap(val: unknown): Record<string, string> | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return toRecordMap(parsed);
      }
      if (Array.isArray(parsed)) {
        const mapped: Record<string, string> = {};
        parsed.forEach((v, idx) => {
          mapped[String(idx + 1)] = String(v ?? "").trim();
        });
        return mapped;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (Array.isArray(val)) {
    const mapped: Record<string, string> = {};
    val.forEach((v, idx) => {
      mapped[String(idx + 1)] = String(v ?? "").trim();
    });
    return mapped;
  }
  if (typeof val === "object") {
    const mapped: Record<string, string> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      mapped[String(k)] = String(v ?? "").trim();
    }
    return mapped;
  }
  return null;
}

export function normalizeScoreType(rawType?: string): string {
  const lower = (rawType ?? "multichoice").toLowerCase().trim();
  if (lower === "multichoice_single") return "multichoice";
  if (lower === "multichoice_multi") return "mcma";
  if (lower === "match") return "matching";
  if (lower === "gapselect" || lower === "ddwtos") return "cloze";
  return lower || "multichoice";
}

export class ScoreCalculatorRule {
  /**
   * Calculate earned fraction (0.0 to 1.0) for a single question,
   * aligned with Moodle 5 mod_cbt\domain\service\score_calculator::calculate_fraction().
   */
  public static calculateFraction(
    type: string,
    expectedKey: unknown,
    studentAnswer: unknown,
    options?: ScoreCalculationOptions,
  ): number {
    if (studentAnswer === null || studentAnswer === undefined) {
      return 0;
    }
    if (typeof studentAnswer === "string" && studentAnswer.trim() === "") {
      return 0;
    }

    const normalizedType = normalizeScoreType(type);

    switch (normalizedType) {
      case "multichoice": {
        const expected = String(expectedKey ?? "")
          .trim()
          .toUpperCase();
        const given = String(studentAnswer).trim().toUpperCase();
        return expected !== "" && expected === given ? 1.0 : 0.0;
      }

      case "mcma": {
        const expectedList = toStringList(expectedKey, true);
        const givenList = toStringList(studentAnswer, true);
        if (expectedList.length === 0) return 0.0;

        const expectedSet = new Set(expectedList);
        let correctCount = 0;
        let incorrectCount = 0;
        for (const choice of givenList) {
          if (expectedSet.has(choice)) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        }

        const earned =
          correctCount / expectedList.length -
          incorrectCount / expectedList.length;
        return Math.max(0.0, Math.min(1.0, earned));
      }

      case "truefalse": {
        const expectedBool = normalizeBoolean(expectedKey);
        const givenBool = normalizeBoolean(studentAnswer);
        if (expectedBool !== null && givenBool !== null) {
          return expectedBool === givenBool ? 1.0 : 0.0;
        }
        return 0.0;
      }

      case "shortanswer": {
        const accepted = toStringList(expectedKey, false).map((s) =>
          s.toLowerCase(),
        );
        if (accepted.length === 0) return 0.0;
        const given = String(studentAnswer).trim().toLowerCase();
        return accepted.includes(given) ? 1.0 : 0.0;
      }

      case "numerical": {
        const userVal = parseNumeric(studentAnswer);
        if (userVal === null) return 0.0;

        let targetVal: number | null = null;
        let tolerance =
          options?.tolerance !== undefined && options?.tolerance !== null
            ? Number(options.tolerance)
            : 0.00001;

        if (
          expectedKey &&
          typeof expectedKey === "object" &&
          !Array.isArray(expectedKey)
        ) {
          const keyObj = expectedKey as {
            answer?: unknown;
            tolerance?: unknown;
          };
          targetVal = parseNumeric(keyObj.answer);
          if (
            keyObj.tolerance !== undefined &&
            keyObj.tolerance !== null &&
            Number.isFinite(Number(keyObj.tolerance))
          ) {
            tolerance = Number(keyObj.tolerance);
          } else if (
            options?.tolerance === undefined ||
            options?.tolerance === null
          ) {
            tolerance = 0.0;
          }
        } else {
          targetVal = parseNumeric(expectedKey);
        }

        if (targetVal === null) return 0.0;
        return Math.abs(userVal - targetVal) <= Math.abs(tolerance) + 1e-9
          ? 1.0
          : 0.0;
      }

      case "matching": {
        const expectedMap = toRecordMap(expectedKey);
        const givenMap = toRecordMap(studentAnswer);
        if (!expectedMap || !givenMap) return 0.0;

        const entries = Object.entries(expectedMap);
        if (entries.length === 0) return 0.0;

        let matched = 0;
        for (const [subq, expectedMatch] of entries) {
          if (
            Object.hasOwn(givenMap, subq) &&
            givenMap[subq].trim() === expectedMatch.trim()
          ) {
            matched++;
          }
        }
        return matched / entries.length;
      }

      case "cloze": {
        const expectedMap = toRecordMap(expectedKey);
        const givenMap = toRecordMap(studentAnswer);
        if (!expectedMap || !givenMap) return 0.0;

        const entries = Object.entries(expectedMap);
        if (entries.length === 0) return 0.0;

        let matched = 0;
        for (const [gapId, expectedChoice] of entries) {
          if (
            Object.hasOwn(givenMap, gapId) &&
            givenMap[gapId].trim().toLowerCase() ===
              expectedChoice.trim().toLowerCase()
          ) {
            matched++;
          }
        }
        return matched / entries.length;
      }

      case "essay":
        return 0.0;

      default:
        return 0.0;
    }
  }

  /**
   * Calculate weighted exam score matching Moodle 5 score_calculator::calculate().
   */
  public static calculateExamScore(
    questionMetaMap: Record<string, QuestionScoreMeta>,
    submittedAnswers: Map<number, AnswerValue> | Record<string, AnswerValue>,
    targetMaxGrade = 100.0,
  ): ExamScoreResult {
    let rawScore = 0;
    let maxRawScore = 0;
    let requiresManualGrading = false;
    const details: Record<string, QuestionScoreDetail> = {};

    for (const [qidStr, meta] of Object.entries(questionMetaMap)) {
      const normalizedType = normalizeScoreType(meta.type);
      const rawWeight = meta.weight ?? meta.points ?? 1.0;
      const weight =
        Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 1.0;
      maxRawScore += weight;

      if (normalizedType === "essay") {
        requiresManualGrading = true;
      }

      let studentAnswer: AnswerValue = null;
      if (submittedAnswers instanceof Map) {
        const numericId = Number.parseInt(qidStr, 10);
        studentAnswer = submittedAnswers.get(numericId) ?? null;
      } else {
        studentAnswer = submittedAnswers[qidStr] ?? null;
      }

      const fraction = ScoreCalculatorRule.calculateFraction(
        normalizedType,
        meta.key,
        studentAnswer,
        { tolerance: meta.tolerance },
      );
      const itemScore = fraction * weight;
      rawScore += itemScore;

      details[qidStr] = {
        questionId: qidStr,
        type: normalizedType,
        weight,
        fraction,
        score: Math.round(itemScore * 100000) / 100000,
        requiresManualGrading: normalizedType === "essay",
      };
    }

    const percentage = maxRawScore > 0 ? rawScore / maxRawScore : 0;
    const finalScore = Math.round(percentage * targetMaxGrade * 100) / 100;

    return {
      finalScore,
      rawScore: Math.round(rawScore * 100000) / 100000,
      maxRawScore: Math.round(maxRawScore * 100000) / 100000,
      requiresManualGrading,
      details,
    };
  }
}
