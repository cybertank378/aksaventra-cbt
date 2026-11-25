import { describe, expect, it } from "vitest";
import {
  cleanHtmlForEditor,
  decodeHtmlEntities,
  hasRichContent,
} from "@/libs/htmlEditorUtils";

describe("htmlEditorUtils", () => {
  it("strips Moodle/ExamView wrapper tags (<div>, <span>, <p>) while preserving <img> tags and attributes", () => {
    const rawMoodleHtml =
      '<div style="text-align:justify"><span style="font-family:TIM">Titik <img width="54" height="20" align="bottom" alt="mc029-1.jpg" src="@@PLUGINFILE@@/ppg__examview_MATEMATIKA_US_2021__00001_res__mc029-1.jpg" border="0"> direfleksikan&nbsp;terhadap sumbu X.</span></div>';

    const cleaned = cleanHtmlForEditor(rawMoodleHtml);

    expect(cleaned).not.toContain("<div");
    expect(cleaned).not.toContain("<span");
    expect(cleaned).not.toContain("&nbsp;");
    expect(cleaned).not.toContain('border="0"');
    expect(cleaned).not.toContain('align="bottom"');
    expect(cleaned).toContain(
      'Titik <img width="54" height="20" alt="mc029-1.jpg" src="@@PLUGINFILE@@/ppg__examview_MATEMATIKA_US_2021__00001_res__mc029-1.jpg"> direfleksikan terhadap sumbu X.',
    );
  });

  it("decodes common HTML entities (&nbsp;, &deg;, &times;, numeric entities)", () => {
    expect(decodeHtmlEntities("Sudut 90&deg; &times; 2 &le; 180&#176;")).toBe(
      "Sudut 90° × 2 ≤ 180°",
    );
  });

  it("detects rich content (images, SVGs, math)", () => {
    expect(hasRichContent("Teks biasa")).toBe(false);
    expect(hasRichContent('Gambar <img src="data:image/png;base64,abc">')).toBe(
      true,
    );
    expect(hasRichContent("Rumus $x^2 + y^2 = r^2$")).toBe(true);
  });
});
