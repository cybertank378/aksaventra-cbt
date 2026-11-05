"use client";

import { Activity } from "lucide-react";
import type React from "react";

export interface ChartEmptyStateProps {
  message?: string;
  description?: string;
  height?: number | string;
}

export function ChartEmptyState({
  message = "Belum ada data pada periode ini",
  description = "Trafik validasi atau perubahan status lisensi akan muncul secara otomatis.",
  height = 260,
}: ChartEmptyStateProps): React.JSX.Element {
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Activity className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default ChartEmptyState;
