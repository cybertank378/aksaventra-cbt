import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRenderCache,
  renderAndSanitizeContent,
} from "@/libs/katexSanitizer";

describe("katexSanitizer (Render-Math-First, Sanitize-Second)", () => {
  beforeEach(() => {
    clearRenderCache();
  });

  it("renders inline math with $ ... $ delimiters into KaTeX markup", () => {
    const raw = "Nilai dari $x^2 + 5x + 6 = 0$ adalah:";
    const result = renderAndSanitizeContent(raw);

    expect(result).toContain("katex");
    expect(result).toContain("Nilai dari");
    expect(result).toContain("adalah:");
  });

  it("renders block math with $$ ... $$ and \\[ ... \\] delimiters", () => {
    const rawBlock1 = "Rumus Pythagoras: $$\\sqrt{a^2 + b^2} = c$$";
    const result1 = renderAndSanitizeContent(rawBlock1);
    expect(result1).toContain("katex-display");

    const rawBlock2 =
      "Persamaan kuadrat: \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]";
    const result2 = renderAndSanitizeContent(rawBlock2);
    expect(result2).toContain("katex-display");
  });

  it("preserves mathematical inequalities (<, >) and ampersands (&) inside formulas", () => {
    const raw = "Himpunan penyelesaian $$x < 10 \\text{ and } y > 2$$";
    const result = renderAndSanitizeContent(raw);

    expect(result).toContain("katex");
    // DOMPurify should not strip or mangle KaTeX math expressions containing < or >
    expect(result).not.toContain("&amp;lt;"); // MathML / KaTeX handles symbols cleanly
  });

  it("strictly sanitizes XSS payloads (scripts, onerror, iframes)", () => {
    const maliciousRaw =
      'Berapa nilai dari $x + y$? <script>alert("xss")</script><img src="invalid.jpg" onerror="alert(1)" /><iframe src="evil.com"></iframe>';
    const result = renderAndSanitizeContent(maliciousRaw);

    expect(result).toContain("katex");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain('alert("xss")');
    expect(result).not.toContain("onerror=");
    expect(result).not.toContain("<iframe");
  });

  it("caches rendered output for subsequent invocations", () => {
    const raw = "Persamaan $E = mc^2$";
    const firstRun = renderAndSanitizeContent(raw);
    const secondRun = renderAndSanitizeContent(raw);

    expect(firstRun).toBe(secondRun);
  });

  it("handles empty or blank content gracefully", () => {
    expect(renderAndSanitizeContent("")).toBe("");
  });
});
