// Files: src/shared-ui/component/TextField.tsx

"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import React, {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useState,
} from "react";

import FormControl from "@/shared-ui/component/Form/FormControl";
import FormHelperText from "@/shared-ui/component/Form/FormHelperText";
import FormLabel from "@/shared-ui/component/Form/FormLabel";

type Variant = "outlined" | "filled" | "custom";

type Size = "lg" | "md" | "sm";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;

  helperText?: string;

  variant?: Variant;

  size?: Size;

  ////////////////////////////////////////////////////////////
  // VALIDATION
  ////////////////////////////////////////////////////////////

  error?: boolean | string;

  success?: boolean;

  ////////////////////////////////////////////////////////////
  // ICON
  ////////////////////////////////////////////////////////////

  leftIcon?: LucideIcon;

  rightIcon?: LucideIcon;

  onRightIconClick?: () => void;

  enablePasswordToggle?: boolean;

  ////////////////////////////////////////////////////////////
  // LENGTH
  ////////////////////////////////////////////////////////////

  maxLengthValue?: number;

  minLengthValue?: number;

  showCounter?: boolean;
}

const sizeMap: Record<Size, string> = {
  lg: "h-12 text-base px-4",

  md: "h-11 text-sm px-3",

  sm: "h-9 text-xs px-2",
};

const variantMap: Record<Variant, string> = {
  outlined: "border bg-white",

  filled: "bg-gray-100 border border-transparent",

  custom: "border rounded-xl bg-white",
};

const TextField = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,

      helperText,

      variant = "outlined",

      size = "md",

      error,

      success,

      leftIcon: LeftIcon,

      rightIcon: RightIcon,

      onRightIconClick,

      enablePasswordToggle,

      type = "text",

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
    //////////////////////////////////////////////////////////
    // STATE
    //////////////////////////////////////////////////////////

    const [showPassword, setShowPassword] = useState(false);

    const [internalError, setInternalError] = useState<string | null>(null);

    //////////////////////////////////////////////////////////
    // PASSWORD
    //////////////////////////////////////////////////////////

    const isPassword = type === "password";

    const inputType =
      enablePasswordToggle && isPassword
        ? showPassword
          ? "text"
          : "password"
        : type;

    const ToggleIcon = showPassword ? EyeOff : Eye;

    //////////////////////////////////////////////////////////
    // CHANGE
    //////////////////////////////////////////////////////////

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const newValue = e.target.value;

      ////////////////////////////////////////////////////////
      // MAX LENGTH
      ////////////////////////////////////////////////////////

      if (maxLengthValue && newValue.length > maxLengthValue) {
        return;
      }

      ////////////////////////////////////////////////////////
      // MIN LENGTH
      ////////////////////////////////////////////////////////

      if (minLengthValue && newValue.length < minLengthValue) {
        setInternalError(`Minimal ${minLengthValue} karakter`);
      } else {
        setInternalError(null);
      }

      onChange?.(e);
    };

    //////////////////////////////////////////////////////////
    // ERROR
    //////////////////////////////////////////////////////////

    const externalErrorMessage = typeof error === "string" ? error : null;

    const externalErrorBoolean =
      typeof error === "boolean" ? error : !!externalErrorMessage;

    const finalError = externalErrorBoolean || !!internalError;

    const finalMessage = internalError ?? externalErrorMessage ?? null;

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (
      <FormControl error={finalError} success={success} disabled={disabled}>
        {label && <FormLabel>{label}</FormLabel>}

        <div className="relative flex items-center">
          {/* LEFT ICON */}

          {LeftIcon && (
            <LeftIcon size={16} className="absolute left-3 text-gray-400" />
          )}

          {/* INPUT */}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            maxLength={maxLengthValue}
            className={clsx(
              "w-full rounded-lg outline-none transition-all",

              "text-gray-800",

              "placeholder:text-gray-600",

              sizeMap[size],

              variantMap[variant],

              finalError && "border-red-500 focus:ring-2 focus:ring-red-200",

              success &&
                !finalError &&
                "border-green-500 focus:ring-2 focus:ring-green-200",

              !finalError &&
                !success &&
                "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",

              LeftIcon && "pl-9",

              (RightIcon || (enablePasswordToggle && isPassword)) && "pr-9",

              disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",

              className,
            )}
            {...props}
          />

          {/* PASSWORD TOGGLE */}

          {enablePasswordToggle && isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              tabIndex={-1}
            >
              <ToggleIcon size={18} />
            </button>
          )}

          {/* RIGHT ICON */}

          {!enablePasswordToggle && RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              tabIndex={-1}
            >
              <RightIcon size={16} />
            </button>
          )}
        </div>

        {/* FOOTER */}

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

TextField.displayName = "TextField";

export default TextField;
