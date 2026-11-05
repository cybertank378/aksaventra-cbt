"use client";

import type React from "react";

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  total?: number;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export function ChartLegend({
  items,
  className = "",
}: ChartLegendProps): React.JSX.Element {
  return (
    <div className={`flex flex-wrap items-center gap-4 text-xs ${className}`}>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-slate-600 font-medium">{item.label}</span>
          {item.total !== undefined && (
            <span className="font-bold tabular-nums text-slate-900">
              ({item.total.toLocaleString("id-ID")})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChartLegend;
