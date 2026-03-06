import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { banks } from "../../data/banks";
import { formatNumber } from "../../lib/utils";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#e11d48", "#0ea5e9", "#d946ef",
  "#65a30d", "#ea580c", "#7c3aed",
];

export function SectorCompositionChart() {
  const data = banks
    .filter((b) => b.sectorShare > 0)
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .map((b) => ({
      name: b.shortName,
      value: b.totalAssets,
      share: b.sectorShare,
    }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Asset Distribution by Bank
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              dataKey="value"
              nameKey="name"
              paddingAngle={1}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatNumber(value), "Total Assets"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              formatter={(value) => (
                <span className="text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
