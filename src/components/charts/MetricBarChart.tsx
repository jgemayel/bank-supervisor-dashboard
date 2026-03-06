import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { BankData } from "../../types";
import { getMetricStatus } from "../../lib/utils";

interface MetricBarChartProps {
  banks: BankData[];
  metric: keyof BankData;
  title: string;
  unit?: string;
  referenceLine?: { value: number; label: string };
  higherIsBetter?: boolean;
  thresholds?: { good: number; caution: number; danger: number };
  color?: string;
}

export function MetricBarChart({
  banks,
  metric,
  title,
  unit = "",
  referenceLine,
  higherIsBetter = true,
  thresholds,
  color = "#3b82f6",
}: MetricBarChartProps) {
  const data = banks
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .map((b) => ({
      name: b.shortName,
      value: b[metric] as number,
      status: thresholds
        ? getMetricStatus(
            b[metric] as number,
            thresholds.good,
            thresholds.caution,
            thresholds.danger,
            higherIsBetter
          )
        : null,
    }));

  const getBarColor = (entry: (typeof data)[0]) => {
    if (!entry.status) return color;
    switch (entry.status) {
      case "good":
        return "#10b981";
      case "caution":
        return "#f59e0b";
      case "danger":
        return "#ef4444";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#64748b" }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              formatter={(value: any) => [
                `${value.toFixed(1)}${unit}`,
                title,
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            {referenceLine && (
              <ReferenceLine
                y={referenceLine.value}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: referenceLine.label,
                  position: "right",
                  style: { fontSize: 10, fill: "#ef4444" },
                }}
              />
            )}
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
