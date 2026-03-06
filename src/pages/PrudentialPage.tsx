import { useState } from "react";
import type { BankData } from "../data/banks";
import { banks, prudentialBenchmarks } from "../data/banks";
import { cn, getMetricStatus } from "../lib/utils";
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

export function PrudentialPage() {
  const [selectedMetric, setSelectedMetric] = useState<number>(0);

  const nplBenchmark = {
    metric: "NPL Ratio (IFRS 9 Stage 3)",
    description: "Non-performing loans as percentage of total credit facilities. Based on IFRS 9 Stage 3 classification.",
    baselStandard: "Basel III Pillar 3 Disclosure - No fixed limit",
    cbsRequirement: "CBS monitoring threshold - sector specific",
    internationalBest: "Well-managed banks typically < 3%",
    unit: "%",
    thresholdGood: 3,
    thresholdCaution: 5,
    thresholdDanger: 10,
    higher_is_better: false,
  };

  const bench = selectedMetric < 6 ? prudentialBenchmarks[selectedMetric] : nplBenchmark;
  const metricKey: keyof BankData = [
    "equityToAssets",
    "roa",
    "roe",
    "costToIncome",
    "loansToDeposits",
    "cashToAssets",
    "nplRatio",
  ][selectedMetric] as keyof BankData;

  // Prepare chart data
  const chartData = banks
    .filter((bank) => bank[metricKey] !== null)
    .map((bank) => {
      const value = bank[metricKey] as number;
      const status = getMetricStatus(
        value,
        bench.thresholdGood,
        bench.thresholdCaution,
        bench.thresholdDanger,
        bench.higher_is_better
      );
      return {
        name: bank.shortName,
        value,
        status,
      };
    })
    .sort((a, b) => b.value - a.value);

  const allBenchmarks = [...prudentialBenchmarks, nplBenchmark];

  const getBarColor = (status: "good" | "caution" | "danger") => {
    switch (status) {
      case "good":
        return "#10b981";
      case "caution":
        return "#f59e0b";
      case "danger":
        return "#ef4444";
    }
  };

  // Compliance matrix data
  const complianceData = banks.map((bank) => {
    const scores = allBenchmarks.map((b, i) => {
      const key: keyof BankData = [
        "equityToAssets",
        "roa",
        "roe",
        "costToIncome",
        "loansToDeposits",
        "cashToAssets",
        "nplRatio",
      ][i] as keyof BankData;
      const value = bank[key] as number | null;
      if (value === null) {
        return null;
      }
      return getMetricStatus(
        value,
        b.thresholdGood,
        b.thresholdCaution,
        b.thresholdDanger,
        b.higher_is_better
      );
    });
    const compliantCount = scores.filter((s) => s === "good").length;
    const metricsWithData = scores.filter((s) => s !== null).length;
    return { bank, scores, compliantCount, metricsWithData };
  });

  return (
    <div className="space-y-3 animate-enter">
      {/* Benchmark Reference Cards - 3x2 Grid (now 3x3 with NPL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {allBenchmarks.map((b, i) => (
          <div key={i} className="card-surface p-3 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {b.metric}
            </div>
            <div className="space-y-1.5 mb-2.5">
              <div className="text-[10px] text-slate-600 dark:text-slate-400">
                {b.cbsRequirement}
              </div>
              <div className="flex gap-1.5 text-[9px] font-medium">
                <div className="flex items-center gap-1">
                  <span className="status-dot green" />
                  Good: {b.higher_is_better ? ">" : "<"} {b.thresholdGood}
                </div>
              </div>
              <div className="flex gap-1.5 text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="status-dot amber" />
                  Caution: {b.higher_is_better ? ">" : "<"} {b.thresholdCaution}
                </div>
              </div>
              <div className="flex gap-1.5 text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="status-dot red" />
                  Danger: {b.higher_is_better ? "<" : ">"} {b.thresholdDanger}
                </div>
              </div>
            </div>
            <div className="text-[8px] text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-1.5">
              Higher is better: {b.higher_is_better ? "Yes" : "No"}
            </div>
          </div>
        ))}
      </div>

      {/* Metric Selector Pills */}
      <div className="card-surface p-2.5 flex gap-1.5 flex-wrap">
        {allBenchmarks.map((_, i) => {
          const shortLabels = [
            "Capital Adequacy",
            "ROA",
            "ROE",
            "Cost-to-Income",
            "Loans-to-Deposits",
            "Cash-to-Assets",
            "NPL Ratio",
          ];
          return (
            <button
              key={i}
              onClick={() => setSelectedMetric(i)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded transition-all",
                selectedMetric === i
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
            >
              {shortLabels[i]}
            </button>
          );
        })}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="card-surface p-3">
        <div className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
          {bench.metric} ({bench.unit})
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="number"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "11px",
              }}
              formatter={(value: any) => [value.toFixed(2), bench.metric]}
            />
            <ReferenceLine
              y={bench.thresholdGood}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: "Good", position: "insideLeft", fill: "#10b981", fontSize: 10 }}
            />
            <ReferenceLine
              y={bench.thresholdCaution}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Caution", position: "insideLeft", fill: "#f59e0b", fontSize: 10 }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Summary Matrix - Dense Table */}
      <div className="card-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Compliance Summary (All 7 Metrics)
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left w-20">Bank</th>
                {allBenchmarks.map((b, i) => (
                  <th key={i} className="text-center w-16">
                    <div className="text-[9px] leading-tight">
                      {i === 6 ? "NPL" : b.metric.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
                    </div>
                  </th>
                ))}
                <th className="text-center w-12">Score</th>
              </tr>
            </thead>
            <tbody>
              {complianceData
                .sort((a, b) => b.bank.totalAssets - a.bank.totalAssets)
                .map((row, idx) => (
                  <tr
                    key={row.bank.id}
                    className={cn(
                      idx % 2 === 0 ? "bg-white dark:bg-slate-800/50" : "bg-slate-50/50 dark:bg-slate-900/20"
                    )}
                  >
                    <td className="font-medium text-slate-900 dark:text-slate-100 text-xs whitespace-nowrap">
                      {row.bank.shortName}
                    </td>
                    {row.scores.map((status, i) => (
                      <td key={i} className="text-center">
                        {status === null ? (
                          <span className="text-slate-400 dark:text-slate-500 text-[9px]">—</span>
                        ) : (
                          <span
                            className={cn(
                              "inline-block w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center",
                              status === "good" && "bg-emerald-100 text-emerald-700",
                              status === "caution" && "bg-amber-100 text-amber-700",
                              status === "danger" && "bg-red-100 text-red-700"
                            )}
                          >
                            {status === "good" ? "✓" : status === "caution" ? "!" : "✗"}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="text-center font-semibold text-xs">
                      <span
                        className={cn(
                          row.compliantCount >= 5
                            ? "text-emerald-600"
                            : row.compliantCount >= 3
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {row.compliantCount}/{row.metricsWithData}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmark Details */}
      <div className="card-surface p-3 text-xs space-y-2">
        <div className="font-semibold text-slate-900 dark:text-slate-100">
          {bench.metric} - Details
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800">
            <div className="font-semibold text-blue-900 dark:text-blue-100 text-[10px] uppercase mb-1">
              Basel III / BCBS
            </div>
            <div className="text-slate-700 dark:text-slate-300">{bench.baselStandard}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 border border-purple-200 dark:border-purple-800">
            <div className="font-semibold text-purple-900 dark:text-purple-100 text-[10px] uppercase mb-1">
              CBS Requirement
            </div>
            <div className="text-slate-700 dark:text-slate-300">{bench.cbsRequirement}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 border border-emerald-200 dark:border-emerald-800">
            <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-[10px] uppercase mb-1">
              International Best
            </div>
            <div className="text-slate-700 dark:text-slate-300">{bench.internationalBest}</div>
          </div>
        </div>
        <div className="text-slate-600 dark:text-slate-400 italic">{bench.description}</div>
      </div>
    </div>
  );
}
