import { describe, expect, it } from "vitest";
import { AnswerRecordEntity } from "@/modules/attempts/domain/entities/AnswerRecordEntity";
import { AnswerRehydrationRule } from "@/modules/attempts/domain/rules/AnswerRehydrationRule";

describe("AnswerRehydrationRule", () => {
  it("should add new questions into mergedAnswers", () => {
    const existing = new Map<number, AnswerRecordEntity>();
    const incoming = [
      { questionId: 101, ans: "A", flag: false, ts: 1000 },
      { questionId: 102, ans: ["B", "C"], flag: true, ts: 1010 },
    ];

    const result = AnswerRehydrationRule.rehydrate(existing, incoming);

    expect(result.updatedCount).toBe(2);
    expect(result.ignoredCount).toBe(0);
    expect(result.mergedAnswers.size).toBe(2);
    expect(result.mergedAnswers.get(101)?.answer).toBe("A");
    expect(result.mergedAnswers.get(102)?.flagged).toBe(true);
  });

  it("should update existing question if incoming has a newer timestamp (LWW)", () => {
    const existing = new Map<number, AnswerRecordEntity>([
      [
        101,
        new AnswerRecordEntity({
          questionId: 101,
          answer: "A",
          flagged: false,
          updatedAt: 1000,
        }),
      ],
    ]);

    const incoming = [{ questionId: 101, ans: "B", flag: false, ts: 2000 }];

    const result = AnswerRehydrationRule.rehydrate(existing, incoming);

    expect(result.updatedCount).toBe(1);
    expect(result.ignoredCount).toBe(0);
    expect(result.mergedAnswers.get(101)?.answer).toBe("B");
    expect(result.mergedAnswers.get(101)?.timestamp).toBe(2000);
  });

  it("should ignore out-of-order stale packets with older or equal timestamps", () => {
    const existing = new Map<number, AnswerRecordEntity>([
      [
        101,
        new AnswerRecordEntity({
          questionId: 101,
          answer: "LatestAnswer",
          flagged: true,
          updatedAt: 5000,
        }),
      ],
    ]);

    const incomingStale = [
      { questionId: 101, ans: "OldAnswer", flag: false, ts: 3000 },
      { questionId: 101, ans: "IdenticalTsAnswer", flag: false, ts: 5000 },
    ];

    const result = AnswerRehydrationRule.rehydrate(existing, incomingStale);

    expect(result.updatedCount).toBe(0);
    expect(result.ignoredCount).toBe(2);
    expect(result.mergedAnswers.get(101)?.answer).toBe("LatestAnswer");
    expect(result.mergedAnswers.get(101)?.flagged).toBe(true);
  });
});
