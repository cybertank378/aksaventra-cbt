//Files: src/shared-ui/component/DatePickerHeader.tsx

"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import type { ReactDatePickerCustomHeaderProps } from "react-datepicker";

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function DatePickerHeader({
  date,

  decreaseMonth,

  increaseMonth,

  prevMonthButtonDisabled,

  nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">
          {format(date, "MMMM yyyy", {
            locale: id,
          })}
        </p>
      </div>

      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
