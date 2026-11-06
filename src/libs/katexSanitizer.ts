import DOMPurify from "isomorphic-dompurify";
import katex from "katex";

/**
 * In-memory cache for rendered and sanitized HTML strings.
 * Key: raw input string, Value: sanitized HTML string.
 */
const renderCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * Configure DOMPurify options to allow KaTeX rendering (HTML, MathML, SVG)
 * while strictly stripping malicious scripts, event handlers, and unsafe tags.
 */
const DOMPURIFY_CONFIG: DOMPurify.Config = {
  USE_PROFILES: {
    html: true,
    mathMl: true,
    svg: true,
  },
  ADD_TAGS: [
    "math",
    "semantics",
    "mrow",
    "mi",
    "mo",
    "mn",
    "msup",
    "msub",
    "msubsup",
    "mfrac",
    "msqrt",
    "mroot",
    "mtable",
    "mtr",
    "mtd",
    "annotation",
  ],
  ADD_ATTR: [
    "xmlns",
    "display",
    "style",
    "class",
    "aria-hidden",
    "role",
    "viewBox",
    "preserveAspectRatio",
    "d",
    "encoding",
  ],
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "javascript:"],
};

/**
 * Safely renders a LaTeX mathematical expression using KaTeX.
 * Returns KaTeX HTML or fallback on error.
 */
function renderMathString(expression: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expression.trim(), {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
    });
  } catch (_err) {
    // Graceful fallback to escaped text if KaTeX parser throws
    return `<span class="katex-error">${expression}</span>`;
  }
}

/**
 * Replaces LaTeX delimiters with rendered KaTeX markup:
 * 1. Block delimiters: $$...$$ and \[...\]
 * 2. Inline delimiters: \(...\) and $...$
 */
function renderLatexTokens(content: string): string {
  if (!content) return "";

  // 1. Block math: $$ ... $$
  let rendered = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    return renderMathString(math, true);
  });

  // 2. Block math: \[ ... \]
  rendered = rendered.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
    return renderMathString(math, true);
  });

  // 3. Inline math: \( ... \)
  rendered = rendered.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
    return renderMathString(math, false);
  });

  // 4. Inline math: $ ... $ (excluding escaped \$ and empty $)
  // Negative lookbehind and lookahead to avoid matching $$
  rendered = rendered.replace(
    /(?<!\$)\$(?!\$)((?:\\\$|[^$])+?)(?<!\$)\$(?!\$)/g,
    (_match, math) => {
      return renderMathString(math, false);
    },
  );

  return rendered;
}

/**
 * Renders LaTeX math in the content and sanitizes the output with DOMPurify.
 * Follows the "Render-Math-First, Sanitize-Second" pattern.
 *
 * @param content Raw string or HTML containing potential LaTeX expressions ($$x$$, $x$, etc.)
 * @returns Sanitized safe HTML string
 */
export function renderAndSanitizeContent(content: string): string {
  if (!content) return "";

  const cached = renderCache.get(content);
  if (cached !== undefined) {
    return cached;
  }

  // Step 1: Render math formulas to HTML/MathML
  const withRenderedMath = renderLatexTokens(content);

  // Step 2: Sanitize HTML output to prevent XSS
  const sanitized = DOMPurify.sanitize(
    withRenderedMath,
    DOMPURIFY_CONFIG as Parameters<typeof DOMPurify.sanitize>[1],
  ) as string;

  // Manage cache size (LRU-like eviction: delete oldest if exceeded limit)
  if (renderCache.size >= MAX_CACHE_SIZE) {
    const firstKey = renderCache.keys().next().value;
    if (firstKey !== undefined) {
      renderCache.delete(firstKey);
    }
  }

  renderCache.set(content, sanitized);
  return sanitized;
}

/**
 * Clears the in-memory render cache (useful for testing or memory management).
 */
export function clearRenderCache(): void {
  renderCache.clear();
}
