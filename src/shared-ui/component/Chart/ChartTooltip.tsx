"use client";

import type React from "react";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  valueFormatter?: (value: number) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg shadow-slate-100/80 transition-all">
      {label && (
        <p className="mb-2 text-xs font-semibold text-slate-700">{label}</p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, idx) => {
          const displayVal =
            valueFormatter && item.value !== undefined
              ? valueFormatter(item.value)
              : (item.value ?? 0).toLocaleString("id-ID");

          return (
            <div
              key={`tooltip-${item.dataKey ?? idx}`}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color ?? "#2563EB" }}
              />
              <span className="text-slate-500">{item.name}:</span>
              <span className="font-bold tabular-nums text-slate-900">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartTooltip;
