import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BankData } from "../../data/banks";
import { banks } from "../../data/banks";
import { formatNumber } from "../../lib/utils";

export function SectorCompositionChart() {
  const data = banks
    .filter((b) => b.sectorShare > 0)
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .map((b: BankData) => ({
      name: b.shortName,
      value: b.totalAssets,
      share: b.sectorShare,
      type: b.type,
    }));

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Conventional":
        return "#3b82f6";
      case "Islamic":
        return "#10b981";
      case "Microfinance":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Asset Distribution by Bank
      </h3>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: "#64748b" }}
              width={75}
            />
            <Tooltip
              formatter={(value: any) => [formatNumber(value), "Total Assets"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                backgroundColor: "#fff",
              }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              label={({ x, y, width, index }: any) => {
                const share = data[index]?.share;
                return (
                  <text x={Number(x) + Number(width) + 8} y={Number(y)} dy={12} fontSize={11} fill="#64748b">
                    {share?.toFixed(1)}%
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
