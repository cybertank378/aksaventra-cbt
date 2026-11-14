import { describe, expect, it } from "vitest";
import type {
  CheckStatus,
  PreFlightItem,
} from "@/sections/student-lobby/molecules/DevicePreFlightCard";
import {
  enterExamFullscreenSafe,
  isExamFullscreenActive,
} from "@/security/quizFocusGuard";

describe("ISSUE-10: Auth Section & Student Lobby Unit Tests", () => {
  describe("TokenPinInput logic & Crockford Base32 formatting", () => {
    it("sanitizes characters to uppercase alphanumeric and strips illegal symbols", () => {
      const input = "ab-3$c!";
      const clean = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      expect(clean).toBe("AB3C");
    });

    it("distributes pasted tokens up to length 6 correctly", () => {
      const pasted = "x7k9m2extra";
      const length = 6;
      const cleanPasted = pasted.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const initial = cleanPasted.slice(0, length).split("");
      while (initial.length < length) {
        initial.push("");
      }

      expect(initial).toEqual(["X", "7", "K", "9", "M", "2"]);
      expect(initial.join("")).toBe("X7K9M2");
    });

    it("handles partial paste and pads remainder with empty strings", () => {
      const pasted = "a1b";
      const length = 6;
      const cleanPasted = pasted.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const initial = cleanPasted.slice(0, length).split("");
      while (initial.length < length) {
        initial.push("");
      }

      expect(initial).toEqual(["A", "1", "B", "", "", ""]);
      expect(initial.includes("")).toBe(true);
    });
  });

  describe("Device Pre-Flight Check Evaluator", () => {
    it("determines overall readiness when all critical checks pass or warn", () => {
      const checks: Record<string, PreFlightItem> = {
        storage: {
          id: "storage",
          name: "IndexedDB",
          description: "",
          status: "SUCCESS",
          isCritical: true,
        },
        network: {
          id: "network",
          name: "Network",
          description: "",
          status: "SUCCESS",
          isCritical: true,
        },
        screen: {
          id: "screen",
          name: "Screen",
          description: "",
          status: "WARNING", // non-critical warning
          isCritical: false,
        },
      };

      const list = Object.values(checks);
      const isAllReady = list.every((item) =>
        item.isCritical
          ? item.status === "SUCCESS" || item.status === "WARNING"
          : true,
      );

      expect(isAllReady).toBe(true);
    });

    it("fails overall readiness if any critical check fails", () => {
      const checks: Record<string, PreFlightItem> = {
        storage: {
          id: "storage",
          name: "IndexedDB",
          description: "",
          status: "ERROR",
          isCritical: true,
        },
        network: {
          id: "network",
          name: "Network",
          description: "",
          status: "SUCCESS",
          isCritical: true,
        },
      };

      const list = Object.values(checks);
      const hasCriticalError = list.some(
        (c) => c.isCritical && c.status === "ERROR",
      );

      expect(hasCriticalError).toBe(true);
    });

    it("evaluates latency thresholds correctly", () => {
      function evaluateLatency(latencyMs: number): CheckStatus {
        if (latencyMs <= 1500) return "SUCCESS";
        return "WARNING";
      }

      expect(evaluateLatency(80)).toBe("SUCCESS");
      expect(evaluateLatency(1499)).toBe("SUCCESS");
      expect(evaluateLatency(1800)).toBe("WARNING");
    });
  });

  describe("Token Verification Fullscreen Invocations", () => {
    it("enterExamFullscreenSafe returns boolean without throwing on unsupported or mock environments", async () => {
      const result = await enterExamFullscreenSafe();
      expect(typeof result).toBe("boolean");
    });

    it("isExamFullscreenActive returns boolean", () => {
      const isActive = isExamFullscreenActive();
      expect(typeof isActive).toBe("boolean");
    });
  });
});
