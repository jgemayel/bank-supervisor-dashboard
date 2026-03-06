import type { BankData } from "../../types";
import { cn, getMetricStatus } from "../../lib/utils";

interface HeatmapMetric {
  key: keyof BankData;
  label: string;
  unit: string;
  good: number;
  caution: number;
  danger: number;
  higherIsBetter: boolean;
}

const metrics: HeatmapMetric[] = [
  { key: "roa", label: "ROA", unit: "%", good: 1.5, caution: 0.5, danger: 0, higherIsBetter: true },
  { key: "roe", label: "ROE", unit: "%", good: 10, caution: 5, danger: 0, higherIsBetter: true },
  { key: "equityToAssets", label: "E/A", unit: "%", good: 15, caution: 10, danger: 8, higherIsBetter: true },
  { key: "costToIncome", label: "C/I", unit: "%", good: 50, caution: 70, danger: 80, higherIsBetter: false },
  { key: "loansToDeposits", label: "L/D", unit: "%", good: 70, caution: 100, danger: 120, higherIsBetter: false },
  { key: "cashToAssets", label: "Cash/A", unit: "%", good: 20, caution: 10, danger: 5, higherIsBetter: true },
];

interface HeatmapTableProps {
  banks: BankData[];
}

export function HeatmapTable({ banks }: HeatmapTableProps) {
  const sorted = [...banks].sort((a, b) => b.totalAssets - a.totalAssets);

  const getCellColor = (status: "good" | "caution" | "danger") => {
    switch (status) {
      case "good": return "bg-emerald-100 text-emerald-800";
      case "caution": return "bg-amber-100 text-amber-800";
      case "danger": return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Prudential Heatmap (all banks)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-medium text-slate-600 sticky left-0 bg-white">
                Bank
              </th>
              {metrics.map((m) => (
                <th
                  key={m.key}
                  className="text-center py-2 px-2 font-medium text-slate-600"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((bank) => (
              <tr key={bank.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-1.5 px-2 font-medium text-slate-900 sticky left-0 bg-white whitespace-nowrap">
                  {bank.shortName}
                </td>
                {metrics.map((m) => {
                  const val = bank[m.key] as number;
                  const status = getMetricStatus(
                    val,
                    m.good,
                    m.caution,
                    m.danger,
                    m.higherIsBetter
                  );
                  return (
                    <td key={m.key} className="py-1.5 px-1 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-[11px] font-medium min-w-[48px]",
                          getCellColor(status)
                        )}
                      >
                        {val.toFixed(1)}{m.unit}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
          Good
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Caution
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          Danger
        </div>
      </div>
    </div>
  );
}
