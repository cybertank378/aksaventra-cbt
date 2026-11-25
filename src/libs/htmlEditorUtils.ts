/**
 * HTML Unescaping & Cleaning Utilities for the CBT Question Editor.
 *
 * Strips noisy Moodle / Word / ExamView wrapper tags (<div style="...">, <span style="font-family:...">, <p>)
 * and decodes HTML entities (&nbsp;, &amp;, &lt;, &gt;, &quot;, &#39;, math symbols)
 * while preserving meaningful media & formatting tags (<img>, <svg>, <table>, <sub>, <sup>) and KaTeX.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&deg;": "°",
  "&times;": "×",
  "&divide;": "÷",
  "&minus;": "−",
  "&plusmn;": "±",
  "&le;": "≤",
  "&ge;": "≥",
  "&ne;": "≠",
  "&approx;": "≈",
  "&pi;": "π",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&theta;": "θ",
  "&lambda;": "λ",
  "&sigma;": "σ",
  "&omega;": "ω",
  "&infin;": "∞",
  "&radic;": "√",
  "&sum;": "∑",
  "&int;": "∫",
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&ldquo;": '"',
  "&rdquo;": '"',
  "&lsquo;": "'",
  "&rsquo;": "'",
};

export function decodeHtmlEntities(input: string): string {
  if (!input) return "";

  let out = input.replace(
    /&(?:nbsp|amp|lt|gt|quot|apos|deg|times|divide|minus|plusmn|le|ge|ne|approx|pi|alpha|beta|gamma|theta|lambda|sigma|omega|infin|radic|sum|int|ndash|mdash|hellip|ldquo|rdquo|lsquo|rsquo|#39);/gi,
    (match) => HTML_ENTITY_MAP[match.toLowerCase()] ?? match,
  );

  // Numeric decimal entities: &#123;
  out = out.replace(/&#(\d+);/g, (_m, dec) => {
    const code = Number.parseInt(dec, 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : _m;
  });

  // Numeric hex entities: &#x1F600;
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : _m;
  });

  return out;
}

/**
 * Cleans Moodle / ExamView / Word wrapper HTML for clean editing in the Question Editor,
 * while preserving embedded <img>, <svg>, <table>, <sub>, and <sup> elements.
 */
export function cleanHtmlForEditor(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // 1. Convert block breaks (<br>, </p>, </div>) to newlines
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n");

  // 2. Strip noisy wrapper tags: <div>, <span>, <p>, <font>, <o:p>, <!--[if ...]>
  cleaned = cleaned
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(?:div|span|p|font|o:p|center|section|article)(?:\s[^>]*)?>/gi, "");

  // 3. Clean obsolete presentational attributes on preserved <img> tags (border="0", align="bottom")
  cleaned = cleaned.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    const cleanedAttrs = attrs
      .replace(/\s+(?:border|align|hspace|vspace)="[^"]*"/gi, "")
      .trim();
    return `<img ${cleanedAttrs}>`;
  });

  // 4. Decode HTML entities (&nbsp;, &amp;, etc.)
  cleaned = decodeHtmlEntities(cleaned);

  // 5. Collapse excessive blank lines and trailing spaces per line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

/**
 * Strips all HTML tags except <sub> and <sup> (useful when the user explicitly requests pure plain text).
 */
export function stripAllHtmlToPlainText(raw: string): string {
  if (!raw) return "";
  const cleaned = cleanHtmlForEditor(raw)
    .replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi, "[$1]")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, "");
  return decodeHtmlEntities(cleaned).replace(/\s+/g, " ").trim();
}

/**
 * Checks whether a question stem or option contains rich HTML/Math that benefits from live visual preview.
 */
export function hasRichContent(text: string): boolean {
  if (!text) return false;
  return (
    /<(?:img|svg|table|sub|sup|math)\b/i.test(text) ||
    /\$[^$]+\$|\\\(|\\\[/.test(text)
  );
}
