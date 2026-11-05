"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      disabled,
      indeterminate = false,
      checked = false,
      className,
      ...props
    },
    ref,
  ) => {
    const isActive = checked || indeterminate;

    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={props.onChange}
            className="sr-only focus:outline-none"
          />

          <div
            className={clsx(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
              isActive
                ? "bg-indigo-600 border-indigo-600"
                : "bg-white border-gray-300",
              disabled && "opacity-50",
              className,
            )}
          >
            {indeterminate ? (
              <span className="w-3 h-0.5 bg-white rounded-sm" />
            ) : checked ? (
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : null}
          </div>
        </div>

        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
