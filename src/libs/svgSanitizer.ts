import DOMPurify from "isomorphic-dompurify";

/**
 * Escapes XML/SVG text node characters to prevent markup breakout inside SVG templates.
 */
export function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitizes generated SVG markup with DOMPurify's strict SVG profile to strip
 * scripts, foreignObject payloads, and inline event handlers.
 */
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });
}
