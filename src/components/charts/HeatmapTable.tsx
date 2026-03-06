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
      case "good": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "caution": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "danger": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
        Prudential Heatmap (all banks)
      </h3>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                Bank
              </th>
              {metrics.map((m) => (
                <th
                  key={m.key}
                  className="text-center py-3 px-3 font-semibold text-slate-700 dark:text-slate-300"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((bank, idx) => (
              <tr
                key={bank.id}
                className={cn(
                  "border-b border-slate-100 dark:border-slate-700 transition-colors duration-200",
                  "hover:bg-slate-50 dark:hover:bg-slate-700/50",
                  idx % 2 === 0 && "bg-white dark:bg-slate-900/50"
                )}
              >
                <td className={cn(
                  "py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 sticky left-0 whitespace-nowrap z-10 transition-colors duration-200",
                  idx % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800/30",
                  "group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50"
                )}>
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
                    <td key={m.key} className="py-2.5 px-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-semibold min-w-[56px]",
                          "transition-all duration-200",
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
      <div className="flex items-center gap-6 mt-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800/50" />
          <span className="font-medium">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800/50" />
          <span className="font-medium">Caution</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800/50" />
          <span className="font-medium">Danger</span>
        </div>
      </div>
    </div>
  );
}
