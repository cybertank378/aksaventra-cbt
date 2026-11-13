"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { renderMathFirstAndSanitize } from "@/libs/katexSanitizer";

export interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Universal safe LaTeX / KaTeX mathematical annotation renderer.
 * Automatically parses inline ($...$, \(...\)) and block ($$...$$, \[...\]) math
 * while strictly sanitizing HTML markup via DOMPurify to prevent XSS.
 */
export const MathRenderer: React.FC<MathRendererProps> = React.memo(
  ({ content, className, inline = false }) => {
    const sanitizedHtml = useMemo(() => {
      if (!content) return "";
      return renderMathFirstAndSanitize(content);
    }, [content]);

    if (inline) {
      return (
        <span
          className={clsx("inline-math-renderer", className)}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized via DOMPurify and KaTeX in renderMathFirstAndSanitize
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    return (
      <div
        className={clsx("math-renderer", className)}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized via DOMPurify and KaTeX in renderMathFirstAndSanitize
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  },
);

MathRenderer.displayName = "MathRenderer";

export default MathRenderer;

