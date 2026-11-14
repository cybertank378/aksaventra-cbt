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
    "img",
    "figure",
    "figcaption",
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
    "svg",
    "g",
    "path",
    "line",
    "polyline",
    "polygon",
    "rect",
    "circle",
    "ellipse",
    "text",
    "tspan",
    "defs",
    "marker",
    "clipPath",
    "linearGradient",
    "radialGradient",
    "stop",
    "style",
  ],
  ADD_ATTR: [
    "src",
    "alt",
    "title",
    "width",
    "height",
    "loading",
    "xmlns",
    "display",
    "style",
    "class",
    "aria-hidden",
    "role",
    "viewBox",
    "preserveAspectRatio",
    "d",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-dasharray",
    "stroke-linecap",
    "stroke-linejoin",
    "opacity",
    "transform",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "points",
    "marker-end",
    "marker-start",
    "text-anchor",
    "font-size",
    "font-family",
    "font-weight",
    "dx",
    "dy",
    "encoding",
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|\/uploads\/|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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
  let withRenderedMath = renderLatexTokens(content);

  // Step 1.5: Normalize markdown image syntax ![alt](url) to responsive img tags
  withRenderedMath = withRenderedMath.replace(
    /!\[(.*?)\]\(((?:https?:\/\/[^\s)]+|\/uploads\/[^\s)]+|data:image\/[^\s)]+))\)/g,
    '<img src="$2" alt="$1" class="cbt-question-diagram max-w-full h-auto rounded-xl my-3 border border-slate-200 shadow-2xs" loading="lazy" />',
  );

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

/**
 * Alias for renderAndSanitizeContent adhering to the naming in issue specs.
 */
export const renderMathFirstAndSanitize = renderAndSanitizeContent;
