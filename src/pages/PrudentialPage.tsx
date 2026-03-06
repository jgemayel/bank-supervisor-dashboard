import { useState } from "react";
import { banks, prudentialBenchmarks } from "../data/banks";
import { MetricBarChart } from "../components/charts/MetricBarChart";
import { HeatmapTable } from "../components/charts/HeatmapTable";
import { cn, getMetricStatus } from "../lib/utils";
import type { BankData } from "../types";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function PrudentialPage() {
  const [expandedBenchmark, setExpandedBenchmark] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("equityToAssets");

  const metricOptions: { key: keyof BankData; label: string; unit: string }[] = [
    { key: "equityToAssets", label: "Equity/Assets Ratio", unit: "%" },
    { key: "roa", label: "Return on Assets", unit: "%" },
    { key: "roe", label: "Return on Equity", unit: "%" },
    { key: "costToIncome", label: "Cost-to-Income Ratio", unit: "%" },
    { key: "loansToDeposits", label: "Loans-to-Deposits Ratio", unit: "%" },
    { key: "cashToAssets", label: "Cash-to-Assets Ratio", unit: "%" },
  ];

  const currentMetric = metricOptions.find((m) => m.key === selectedMetric) || metricOptions[0];
  const currentBenchmark = prudentialBenchmarks.find(
    (b) =>
      b.metric.toLowerCase().includes(currentMetric.label.toLowerCase().split(" ")[0]) ||
      currentMetric.label.toLowerCase().includes(b.metric.toLowerCase().split(" ")[0])
  );

  return (
    <div className="space-y-6">
      {/* Benchmark Reference Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Prudential Benchmarks Reference
          </h3>
        </div>
        <div className="space-y-2">
          {prudentialBenchmarks.map((bench, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                onClick={() =>
                  setExpandedBenchmark(expandedBenchmark === i ? null : i)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {bench.metric}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({bench.unit})
                  </span>
                </div>
                {expandedBenchmark === i ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedBenchmark === i && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-600">{bench.description}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider mb-0.5">
                        Basel III / BCBS
                      </p>
                      <p className="text-xs text-slate-900">{bench.baselStandard}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider mb-0.5">
                        CBS Requirement
                      </p>
                      <p className="text-xs text-slate-900">
                        {bench.cbsRequirement}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-0.5">
                        International Best Practice
                      </p>
                      <p className="text-xs text-slate-900">
                        {bench.internationalBest}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Good: {bench.higher_is_better ? ">" : "<"}{" "}
                      {bench.thresholdGood}
                      {bench.unit}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Caution: {bench.higher_is_better ? ">" : "<"}{" "}
                      {bench.thresholdCaution}
                      {bench.unit}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Danger: {bench.higher_is_better ? "<" : ">"}{" "}
                      {bench.thresholdDanger}
                      {bench.unit}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metric Selector + Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {metricOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedMetric(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                selectedMetric === opt.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <MetricBarChart
          banks={banks}
          metric={currentMetric.key as keyof BankData}
          title={`${currentMetric.label} by Bank`}
          unit={currentMetric.unit}
          higherIsBetter={currentBenchmark?.higher_is_better ?? true}
          thresholds={
            currentBenchmark
              ? {
                  good: currentBenchmark.thresholdGood,
                  caution: currentBenchmark.thresholdCaution,
                  danger: currentBenchmark.thresholdDanger,
                }
              : undefined
          }
          referenceLine={
            currentBenchmark
              ? {
                  value: currentBenchmark.thresholdCaution,
                  label: "Caution Threshold",
                }
              : undefined
          }
        />
      </div>

      {/* Bank Compliance Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Compliance Summary (All Metrics)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-medium text-slate-600">
                  Bank
                </th>
                {prudentialBenchmarks.map((b) => (
                  <th
                    key={b.metric}
                    className="text-center py-2 px-2 font-medium text-slate-600"
                  >
                    {b.metric.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
                  </th>
                ))}
                <th className="text-center py-2 px-2 font-medium text-slate-600">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {[...banks]
                .sort((a, b) => b.totalAssets - a.totalAssets)
                .map((bank) => {
                  let goodCount = 0;
                  const metricKeys: (keyof BankData)[] = [
                    "equityToAssets",
                    "roa",
                    "roe",
                    "costToIncome",
                    "loansToDeposits",
                    "cashToAssets",
                  ];
                  const statuses = prudentialBenchmarks.map((bench, i) => {
                    const val = bank[metricKeys[i]] as number;
                    const status = getMetricStatus(
                      val,
                      bench.thresholdGood,
                      bench.thresholdCaution,
                      bench.thresholdDanger,
                      bench.higher_is_better
                    );
                    if (status === "good") goodCount++;
                    return status;
                  });

                  return (
                    <tr
                      key={bank.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-1.5 px-2 font-medium text-slate-900 whitespace-nowrap">
                        {bank.shortName}
                      </td>
                      {statuses.map((status, i) => (
                        <td key={i} className="py-1.5 px-1 text-center">
                          <span
                            className={cn(
                              "inline-block w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto",
                              status === "good" && "bg-emerald-100 text-emerald-700",
                              status === "caution" && "bg-amber-100 text-amber-700",
                              status === "danger" && "bg-red-100 text-red-700"
                            )}
                          >
                            {status === "good"
                              ? "\u2713"
                              : status === "caution"
                              ? "!"
                              : "\u2717"}
                          </span>
                        </td>
                      ))}
                      <td className="py-1.5 px-2 text-center font-semibold">
                        <span
                          className={cn(
                            "text-xs",
                            goodCount >= 5
                              ? "text-emerald-600"
                              : goodCount >= 3
                              ? "text-amber-600"
                              : "text-red-600"
                          )}
                        >
                          {goodCount}/{prudentialBenchmarks.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Heatmap */}
      <HeatmapTable banks={banks} />
    </div>
  );
}
