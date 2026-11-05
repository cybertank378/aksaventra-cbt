"use client";

import type React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartEmptyState } from "@/shared-ui/component/Chart/ChartEmptyState";
import { ChartTooltip } from "@/shared-ui/component/Chart/ChartTooltip";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  slices: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  emptyMessage?: string;
}

export function DonutChart({
  slices,
  height = 240,
  centerLabel,
  centerSubLabel = "Total Lisensi",
  emptyMessage,
}: DonutChartProps): React.JSX.Element {
  const total = slices.reduce((acc, s) => acc + s.value, 0);

  if (total === 0 || slices.length === 0) {
    return <ChartEmptyState height={height} message={emptyMessage} />;
  }

  const chartData = slices.map((s) => ({
    name: s.label,
    value: s.value,
    color: s.color,
  }));

  const displayCenter = centerLabel ?? total.toLocaleString("id-ID");

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold tabular-nums text-slate-900">
          {displayCenter}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {centerSubLabel}
        </span>
      </div>
    </div>
  );
}

export default DonutChart;
