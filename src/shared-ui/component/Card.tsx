"use client";

import clsx from "clsx";
import type React from "react";

export type CardVariant = "default" | "elevated" | "flat" | "navy" | "teal";

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  bodyClassName?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-slate-200/80 shadow-sm text-slate-900",
  elevated: "bg-white border border-slate-100 shadow-md text-slate-900",
  flat: "bg-slate-50/70 border border-slate-200/60 text-slate-900",
  navy: "bg-[#0d2b5c] text-white border border-[#163b78] shadow-md",
  teal: "bg-[#0097a7] text-white border border-[#007987] shadow-md",
};

export default function Card({
  children,
  title,
  subtitle,
  headerRight,
  footer,
  variant = "default",
  className,
  bodyClassName,
  onClick,
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerRight);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={clsx(
        "rounded-2xl transition-all duration-150 overflow-hidden",
        variantStyles[variant],
        onClick && "cursor-pointer hover:shadow-md hover:border-slate-300",
        className,
      )}
    >
      {hasHeader && (
        <div
          className={clsx(
            "flex items-center justify-between px-6 py-4 border-b",
            variant === "navy" || variant === "teal"
              ? "border-white/10"
              : "border-slate-100",
          )}
        >
          <div>
            {title && (
              <h3 className="font-bold text-base md:text-lg tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={clsx(
                  "text-xs md:text-sm mt-0.5",
                  variant === "navy" || variant === "teal"
                    ? "text-white/70"
                    : "text-slate-500",
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}

      <div className={clsx("p-6", bodyClassName)}>{children}</div>

      {footer && (
        <div
          className={clsx(
            "px-6 py-3.5 border-t",
            variant === "navy" || variant === "teal"
              ? "border-white/10 bg-white/5"
              : "border-slate-100 bg-slate-50/50",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export { Card };
