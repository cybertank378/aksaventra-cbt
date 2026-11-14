//Files: src/shared-ui/component/TextAreaField.tsx
"use client";

import clsx from "clsx";
import React, {
  forwardRef,
  type ReactNode,
  type TextareaHTMLAttributes,
  useState,
} from "react";

import FormControl from "@/shared-ui/component/Form/FormControl";
import FormHelperText from "@/shared-ui/component/Form/FormHelperText";
import FormLabel from "@/shared-ui/component/Form/FormLabel";

type Variant = "outlined" | "filled" | "custom";
type Size = "lg" | "md" | "sm";

interface Props
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: ReactNode;
  helperText?: string;
  variant?: Variant;
  size?: Size;

  // SUPPORT BOOLEAN ATAU STRING
  error?: boolean | string;
  success?: boolean;

  maxLengthValue?: number;
  minLengthValue?: number;
  showCounter?: boolean;
}

const sizeMap: Record<Size, string> = {
  lg: "min-h-[120px] text-base px-4 py-3",
  md: "min-h-[100px] text-sm px-3 py-2.5",
  sm: "min-h-[80px] text-xs px-2 py-2",
};

const variantMap: Record<Variant, string> = {
  outlined: "border bg-white",
  filled: "bg-gray-100 border border-transparent",
  custom: "border rounded-xl bg-white",
};

const TextAreaField = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      helperText,
      variant = "outlined",
      size = "md",
      error,
      success,
      disabled,
      className,
      maxLengthValue,
      minLengthValue,
      showCounter,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    const [internalError, setInternalError] = useState<string | null>(null);

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      const newValue = e.target.value;

      // HARD STOP MAX LENGTH
      if (maxLengthValue && newValue.length > maxLengthValue) {
        return;
      }

      // OPTIONAL MIN LENGTH VALIDATION
      if (minLengthValue && newValue.length < minLengthValue) {
        setInternalError(`Minimal ${minLengthValue} karakter`);
      } else {
        setInternalError(null);
      }

      onChange?.(e);
    };

    // HANDLE EXTERNAL ERROR
    const externalErrorMessage = typeof error === "string" ? error : null;

    const externalErrorBoolean =
      typeof error === "boolean" ? error : !!externalErrorMessage;

    const finalError = externalErrorBoolean || !!internalError;

    const finalMessage = internalError ?? externalErrorMessage ?? null;

    return (
      <FormControl error={finalError} success={success} disabled={disabled}>
        {label && <FormLabel>{label}</FormLabel>}

        <textarea
          ref={ref}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          maxLength={maxLengthValue}
          className={clsx(
            "w-full rounded-lg outline-none transition-all resize-none",
            "text-gray-800 placeholder:text-gray-600",
            sizeMap[size],
            variantMap[variant],
            finalError && "border-red-500 focus:ring-2 focus:ring-red-200",
            success &&
              !finalError &&
              "border-green-500 focus:ring-2 focus:ring-green-200",
            !finalError &&
              !success &&
              "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
            disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
            className,
          )}
          {...props}
        />

        {/* MESSAGE SECTION */}
        <div className="mt-1 space-y-1">
          {finalMessage && (
            <FormHelperText error>{finalMessage}</FormHelperText>
          )}

          {!finalMessage && helperText && (
            <FormHelperText success={success}>{helperText}</FormHelperText>
          )}

          {showCounter && maxLengthValue && (
            <div className="text-right text-xs text-gray-400">
              {String(value ?? "").length} / {maxLengthValue}
            </div>
          )}
        </div>
      </FormControl>
    );
  },
);

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;
