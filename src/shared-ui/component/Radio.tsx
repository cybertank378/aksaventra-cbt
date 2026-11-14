//Files: src/shared-ui/component/Radio.tsx

"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, Props>(
  ({ label, disabled, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <span className="relative">
          <input
            ref={ref}
            type="radio"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />

          <span
            className={clsx(
              "w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all",
              "peer-checked:border-indigo-600",
              "peer-focus:ring-2 peer-focus:ring-indigo-300",
              disabled && "opacity-50",
            )}
          >
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
          </span>
        </span>

        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  },
);

Radio.displayName = "Radio";
export default Radio;
