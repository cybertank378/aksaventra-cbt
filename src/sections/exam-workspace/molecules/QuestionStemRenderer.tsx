"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { renderMathFirstAndSanitize } from "@/libs/katexSanitizer";
import type { ExamFontSize } from "../atoms/FontSizeToggle";

export interface QuestionStemRendererProps {
  htmlContent: string;
  fontSize?: ExamFontSize;
  className?: string;
}

const fontSizeClasses: Record<ExamFontSize, string> = {
  sm: "text-sm leading-relaxed",
  base: "text-base leading-relaxed",
  lg: "text-lg leading-loose",
  xl: "text-xl leading-loose",
};

export const QuestionStemRenderer: React.FC<QuestionStemRendererProps> =
  React.memo(({ htmlContent, fontSize = "base", className }) => {
    // Memoize the KaTeX + DOMPurify rendering to prevent unnecessary recalculations
    const sanitizedHtml = useMemo(() => {
      if (!htmlContent) return "";
      return renderMathFirstAndSanitize(htmlContent);
    }, [htmlContent]);

    return (
      <div
        className={clsx(
          "cbt-question-stem prose max-w-none text-slate-800 break-words",
          fontSizeClasses[fontSize],
          className,
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify and KaTeX
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  });

QuestionStemRenderer.displayName = "QuestionStemRenderer";

export default QuestionStemRenderer;
