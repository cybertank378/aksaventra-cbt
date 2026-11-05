//Files: src/shared-ui/component/DatePicker.tsx

"use client";

import "react-datepicker/dist/react-datepicker.css";

import clsx from "clsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef } from "react";

import BaseDatePicker from "react-datepicker";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

type Variant = "outlined" | "filled";

type Size = "sm" | "md" | "lg";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

export interface DatePickerProps {
  label?: string;

  placeholder?: string;

  value?: Date | null;

  onChange?: (value: Date | null) => void;

  error?: string;

  helperText?: string;

  required?: boolean;

  disabled?: boolean;

  className?: string;

  variant?: Variant;

  size?: Size;

  minDate?: Date;

  maxDate?: Date;
}

//////////////////////////////////////////////////////////////
// SIZE
//////////////////////////////////////////////////////////////

const SIZE = {
  sm: "h-10 px-3 text-sm",

  md: "h-11 px-4 text-sm",

  lg: "h-12 px-5 text-base",
};

//////////////////////////////////////////////////////////////
// INPUT
//////////////////////////////////////////////////////////////

interface InputProps {
  value?: string;

  placeholder?: string;

  onClick?: () => void;

  disabled?: boolean;

  size?: Size;
}

const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, placeholder, onClick, disabled, size = "md" }, ref) => {
    return (
      <button
        ref={ref as never}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={clsx(
          "flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white text-left transition-all hover:border-sky-500 focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100",
          SIZE[size],
        )}
      >
        <span
          className={clsx(
            "truncate",
            value ? "text-slate-900" : "text-slate-400",
          )}
        >
          {value || placeholder}
        </span>

        <CalendarIcon className="h-4 w-4 text-slate-500" />
      </button>
    );
  },
);

CustomInput.displayName = "CustomInput";

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function DatePicker({
  label,
  placeholder = "Pilih tanggal",
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  className,
  variant = "outlined",
  size = "md",
  minDate,
  maxDate,
}: DatePickerProps) {
  //////////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////////

  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <div className="block text-sm font-medium text-slate-700">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </div>
      )}

      <BaseDatePicker
        selected={value}
        onChange={(date: Date | null) => onChange?.(date)}
        locale={id}
        disabled={disabled}
        dateFormat="dd MMMM yyyy"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        showPopperArrow={false}
        fixedHeight
        calendarStartDay={1}
        customInput={
          <CustomInput
            placeholder={placeholder}
            disabled={disabled}
            size={size}
          />
        }
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-semibold text-slate-800">
              {format(date, "MMMM yyyy", {
                locale: id,
              })}
            </span>

            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        dayClassName={(date: Date) =>
          clsx(
            "rounded-lg transition-colors",
            value &&
              date.toDateString() === value.toDateString() &&
              "bg-sky-600 text-white hover:bg-sky-700",
          )
        }
        wrapperClassName="w-full"
        popperClassName="z-50"
        calendarClassName={clsx(
          "overflow-hidden rounded-2xl border border-slate-200 shadow-xl",
          variant === "filled" ? "bg-slate-50" : "bg-white",
        )}
      />

      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
