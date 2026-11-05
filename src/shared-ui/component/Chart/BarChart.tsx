"use client";

import type React from "react";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmptyState } from "@/shared-ui/component/Chart/ChartEmptyState";
import { ChartTooltip } from "@/shared-ui/component/Chart/ChartTooltip";

export interface BarSeriesConfig {
  key: string;
  label: string;
  color: string;
}

export interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xAxisKey: string;
  series: BarSeriesConfig[];
  height?: number;
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}

export function BarChart({
  data,
  xAxisKey,
  series,
  height = 240,
  valueFormatter,
  emptyMessage,
}: BarChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return <ChartEmptyState height={height} message={emptyMessage} />;
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
