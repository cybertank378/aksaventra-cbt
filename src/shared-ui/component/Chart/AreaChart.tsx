"use client";

import type React from "react";
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmptyState } from "@/shared-ui/component/Chart/ChartEmptyState";
import { ChartTooltip } from "@/shared-ui/component/Chart/ChartTooltip";

export interface AreaSeriesConfig {
  key: string;
  label: string;
  color: string;
  stackId?: string;
}

export interface AreaChartProps {
  data: Array<Record<string, unknown>>;
  xAxisKey: string;
  series: AreaSeriesConfig[];
  height?: number;
  stacked?: boolean;
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}

export function AreaChart({
  data,
  xAxisKey,
  series,
  height = 280,
  stacked = true,
  valueFormatter,
  emptyMessage,
}: AreaChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return <ChartEmptyState height={height} message={emptyMessage} />;
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={`gradient-${s.key}`}
                id={`area-gradient-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
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
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#area-gradient-${s.key})`}
              stackId={stacked ? (s.stackId ?? "1") : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChart;
