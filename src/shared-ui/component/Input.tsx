"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import React, {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string | null;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = true,
      className,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={clsx("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7] focus:border-transparent",
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              error
                ? "border-rose-400 focus:ring-rose-500"
                : "border-slate-300 hover:border-slate-400",
              disabled && "bg-slate-100 text-slate-400 cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
