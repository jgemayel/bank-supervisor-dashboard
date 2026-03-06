import { useState, useMemo } from "react";
import type { BankData, PrudentialBenchmark } from "../types";
import { banks, prudentialBenchmarks } from "../data/banks";
import { cn, formatSYP, formatPercent, getMetricStatus, CHART_TOOLTIP_STYLE } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Bank colors for charts
const BANK_COLORS = ["#3b82f6", "#ef4444", "#10b981"];

interface MetricMapping {
  key: keyof BankData;
  label: string;
  benchmarkIndex: number;
}

const METRICS: MetricMapping[] = [
  { key: "equityToAssets", label: "Capital Adequacy", benchmarkIndex: 0 },
  { key: "roa", label: "Return on Assets", benchmarkIndex: 1 },
  { key: "roe", label: "Return on Equity", benchmarkIndex: 2 },
  { key: "costToIncome", label: "Cost-to-Income", benchmarkIndex: 3 },
  { key: "loansToDeposits", label: "Loans-to-Deposits", benchmarkIndex: 4 },
  { key: "cashToAssets", label: "Cash-to-Assets", benchmarkIndex: 5 },
  { key: "nplRatio", label: "NPL Ratio", benchmarkIndex: -1 },
];

export function ComparePage() {
  // Sort banks by total assets and default to top 3
  const sortedByAssets = useMemo(
    () => [...banks].sort((a, b) => (b.totalAssets || 0) - (a.totalAssets || 0)),
    []
  );

  const defaultBankIds = [sortedByAssets[0]?.id, sortedByAssets[1]?.id, sortedByAssets[2]?.id].filter(
    (id): id is number => id !== undefined
  );

  const [selectedBankIds, setSelectedBankIds] = useState<number[]>(defaultBankIds);

  // Get selected bank data
  const selectedBanks = useMemo(
    () =>
      selectedBankIds
        .map((id) => banks.find((b) => b.id === id))
        .filter((b): b is BankData => b !== undefined),
    [selectedBankIds]
  );

  // Get best performer for each metric

  // Comparison data for bar chart
  const comparisonData = useMemo(() => {
    if (selectedBanks.length === 0) return [];

    // Calculate sector averages
    const sectorAverage: Record<string, number> = {};
    METRICS.forEach((metric) => {
      let values: number[];

      if (metric.key === "nplRatio") {
        // For NPL, filter out null values
        values = banks
          .map((b) => b[metric.key] as number | null)
          .filter((v): v is number => v !== null && typeof v === "number" && !isNaN(v));
      } else {
        values = banks
          .map((b) => b[metric.key] as number)
          .filter((v): v is number => typeof v === "number" && !isNaN(v));
      }

      sectorAverage[metric.key] = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
    });

    return METRICS.map((metric) => {
      const dataPoint: Record<string, any> = {
        name: metric.label,
        sectorAvg: parseFloat(sectorAverage[metric.key].toFixed(2)),
      };

      selectedBanks.forEach((bank) => {
        const value = metric.key === "nplRatio"
          ? (bank[metric.key] as number | null)
          : (bank[metric.key] as number);
        dataPoint[bank.shortName] = value !== undefined && value !== null ? parseFloat(value.toFixed(2)) : 0;
      });

      return dataPoint;
    });
  }, [selectedBanks]);

  // Radar chart data (normalized 0-100)
  const radarData = useMemo(() => {
    if (selectedBanks.length === 0) return [];

    const normalizeMetric = (value: number | undefined, benchmarkIndex: number): number => {
      if (value === undefined || isNaN(value)) return 0;

      const bench = prudentialBenchmarks[benchmarkIndex];

      if (bench.higher_is_better) {
        // For higher-is-better metrics, normalize based on good threshold
        const normalized = (value / bench.thresholdGood) * 100;
        return Math.min(normalized, 100);
      } else {
        // For lower-is-better metrics, invert
        const normalized = 100 - (value / bench.thresholdGood) * 100;
        return Math.max(normalized, 0);
      }
    };

    const radarLabels = ["Capital", "ROA", "ROE", "Efficiency", "Stability", "Liquidity", "NPL"];

    return radarLabels.map((label, idx) => {
      const metric = METRICS[idx];
      const dataPoint: Record<string, any> = { subject: label };

      selectedBanks.forEach((bank) => {
        // For NPL (index 6), handle specially
        if (idx === 6) {
          const nplValue = bank.nplRatio;
          if (nplValue === null || nplValue === undefined) {
            dataPoint[bank.shortName] = 0;
          } else {
            // Lower is better, normalize against 3% good threshold
            const normalized = Math.max(0, 100 - (nplValue / 3) * 100);
            dataPoint[bank.shortName] = Math.max(normalized, 0);
          }
        } else {
          const value = bank[metric.key] as number;
          dataPoint[bank.shortName] = normalizeMetric(value, metric.benchmarkIndex);
        }
      });

      return dataPoint;
    });
  }, [selectedBanks]);

  // Prudential compliance table data
  const complianceTableData = useMemo(() => {
    return METRICS.map((metric) => {
      const row: Record<string, any> = {
        metric: metric.label,
      };

      // For NPL (benchmarkIndex -1), use a local benchmark object
      let bench: PrudentialBenchmark;
      if (metric.benchmarkIndex === -1) {
        const nplBench = {
          thresholdGood: 3,
          thresholdCaution: 5,
          thresholdDanger: 10,
          higher_is_better: false,
        };
        bench = nplBench as any;
      } else {
        bench = prudentialBenchmarks[metric.benchmarkIndex];
      }

      row.benchmark = bench;

      selectedBanks.forEach((bank) => {
        if (metric.key === "nplRatio") {
          const value = bank.nplRatio;
          if (value === null || value === undefined) {
            row[`bank_${bank.id}`] = { value: null, status: "good", bankId: bank.id, isNA: true };
          } else {
            const status = getMetricStatus(
              value,
              bench.thresholdGood,
              bench.thresholdCaution,
              bench.thresholdDanger,
              bench.higher_is_better
            );
            row[`bank_${bank.id}`] = { value, status, bankId: bank.id };
          }
        } else {
          const value = bank[metric.key] as number;
          const status = getMetricStatus(
            value,
            bench.thresholdGood,
            bench.thresholdCaution,
            bench.thresholdDanger,
            bench.higher_is_better
          );
          row[`bank_${bank.id}`] = { value, status, bankId: bank.id };
        }
      });

      // Add sector average
      let sectorValues: number[];
      if (metric.key === "nplRatio") {
        sectorValues = banks
          .map((b) => b.nplRatio as number | null)
          .filter((v): v is number => v !== null && typeof v === "number" && !isNaN(v));
      } else {
        sectorValues = banks
          .map((b) => b[metric.key] as number)
          .filter((v): v is number => typeof v === "number" && !isNaN(v));
      }
      row.sectorAvg = sectorValues.length > 0 ? sectorValues.reduce((a, b) => a + b) / sectorValues.length : 0;

      return row;
    });
  }, [selectedBanks]);

  // KPI cards data
  const kpiMetrics = [
    { label: "Total Assets", key: "totalAssets" as keyof BankData, format: formatSYP },
    { label: "Equity", key: "equity" as keyof BankData, format: formatSYP },
    { label: "Net Profit", key: "netProfit" as keyof BankData, format: formatSYP },
    { label: "ROA", key: "roa" as keyof BankData, format: (v: number) => formatPercent(v) },
    { label: "ROE", key: "roe" as keyof BankData, format: (v: number) => formatPercent(v) },
    { label: "Equity/Assets", key: "equityToAssets" as keyof BankData, format: (v: number) => formatPercent(v) },
    { label: "NPL Ratio", key: "nplRatio" as keyof BankData, format: (v: number) => v !== null ? formatPercent(v) : "N/A" },
  ];

  const handleBankChange = (index: number, bankId: number) => {
    const newSelection = [...selectedBankIds];
    newSelection[index] = bankId;
    setSelectedBankIds(newSelection);
  };

  const renderStatusDot = (status: "good" | "caution" | "danger") => {
    const colors = {
      good: "bg-emerald-500",
      caution: "bg-amber-500",
      danger: "bg-red-500",
    };
    return <div className={cn("w-2 h-2 rounded-full", colors[status])} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 animate-enter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="card-surface p-6 border-l-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Peer Comparison</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Compare selected banks across key financial metrics and prudential benchmarks
          </p>
        </div>

        {/* Bank Selector */}
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Select Banks to Compare
          </h2>
          <div className="flex flex-wrap gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Bank {index + 1}
                </label>
                <select
                  value={selectedBankIds[index] || ""}
                  onChange={(e) => handleBankChange(index, parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm"
                >
                  <option value="">Select a bank</option>
                  {sortedByAssets.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.shortName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {selectedBanks.length > 0 && (
          <>
            {/* KPI Cards - Side by Side */}
            <div className="card-surface p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Key Performance Indicators
              </h2>
              <div className="space-y-4">
                {kpiMetrics.map((metric) => {
                  const bestId = useMemo(() => {
                    let values = selectedBanks.map((b) => ({
                      id: b.id,
                      value: b[metric.key] as number | null,
                    }));

                    // Filter out null values for comparison
                    const nonNullValues = values.filter((v): v is { id: number; value: number } => v.value !== null && v.value !== undefined);
                    if (nonNullValues.length === 0) return null;

                    // For most metrics, higher is better except C/I, L/D, and NPL
                    const isHigherBetter = !["costToIncome", "loansToDeposits", "nplRatio"].includes(metric.key);
                    if (isHigherBetter) {
                      return nonNullValues.reduce((best, cur) => (cur.value > best.value ? cur : best)).id;
                    } else {
                      return nonNullValues.reduce((best, cur) => (cur.value < best.value ? cur : best)).id;
                    }
                  }, [metric.key, selectedBanks]);

                  return (
                    <div key={metric.key}>
                      <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        {metric.label}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedBanks.map((bank) => {
                          const value = bank[metric.key] as number | null;
                          const isBest = bestId !== null && bank.id === bestId;
                          return (
                            <div
                              key={bank.id}
                              className={cn(
                                "p-3 rounded-lg border",
                                isBest
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-900/50"
                                  : "bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                    {bank.shortName}
                                  </div>
                                  <div className="text-lg font-bold mt-1 text-gray-900 dark:text-slate-100">
                                    {value !== null && value !== undefined ? metric.format(value) : "N/A"}
                                  </div>
                                </div>
                                {isBest && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grouped Bar Chart */}
            <div className="card-surface p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Metrics Comparison
              </h2>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-4">
                7 key metrics with sector average benchmark
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend fontSize={12} />
                  {selectedBanks.map((bank, idx) => (
                    <Bar
                      key={bank.id}
                      dataKey={bank.shortName}
                      fill={BANK_COLORS[idx % BANK_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                  <Bar
                    dataKey="sectorAvg"
                    fill="#9ca3af"
                    opacity={0.5}
                    name="Sector Avg"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="card-surface p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Performance Profile
              </h2>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-4">
                Normalized 0-100 scale - higher is better on all axes
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#cbd5e1" fontSize={11} />
                  {selectedBanks.map((bank, idx) => (
                    <Radar
                      key={bank.id}
                      name={bank.shortName}
                      dataKey={bank.shortName}
                      stroke={BANK_COLORS[idx % BANK_COLORS.length]}
                      fill={BANK_COLORS[idx % BANK_COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Legend fontSize={12} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Prudential Compliance Table */}
            <div className="card-surface p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Prudential Compliance
              </h2>
              <table className="data-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {selectedBanks.map((bank) => (
                      <th key={bank.id} className="text-center">{bank.shortName}</th>
                    ))}
                    <th className="text-center">Sector Avg</th>
                    <th className="text-center">CBS Target</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceTableData.map((row, idx) => {
                    const bench = row.benchmark as any;
                    return (
                      <tr key={idx}>
                        <td className="font-medium text-gray-900 dark:text-slate-100">
                          {row.metric}
                        </td>
                        {selectedBanks.map((bank) => {
                          const data = row[`bank_${bank.id}`];
                          return (
                            <td key={bank.id} className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {renderStatusDot(data.status)}
                                <span className="text-gray-900 dark:text-slate-100">
                                  {data.isNA ? "N/A" : `${data.value.toFixed(1)}%`}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="text-center numeric text-gray-700 dark:text-slate-300">
                          {row.sectorAvg.toFixed(1)}%
                        </td>
                        <td className="text-center numeric text-gray-700 dark:text-slate-300 font-medium">
                          {bench.higher_is_better ? "≥" : "≤"} {bench.thresholdGood}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bank Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedBanks.map((bank) => (
                <div key={bank.id} className="card-surface p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      {bank.shortName}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      {bank.name}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-slate-500 mt-1">
                      {bank.type}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {/* Audit Opinion */}
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase mb-1">
                        Audit Opinion
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium",
                        bank.auditOpinion === "Clean"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : bank.auditOpinion === "Qualified"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                      )}>
                        {bank.auditOpinion === "Clean" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {bank.auditOpinion}
                      </div>
                    </div>

                    {/* Risk Rating */}
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase mb-1">
                        Risk Rating
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium",
                        bank.riskRating === "Low"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : bank.riskRating === "Medium"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : bank.riskRating === "High"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200"
                      )}>
                        {bank.riskRating}
                      </div>
                    </div>

                    {/* NPL Ratio */}
                    {bank.nplRatio !== null && bank.nplRatio !== undefined && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase mb-1">
                          NPL Ratio
                        </div>
                        <div className={cn(
                          "inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium",
                          bank.nplRatio <= 3
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : bank.nplRatio <= 5
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}>
                          {formatPercent(bank.nplRatio)}
                        </div>
                      </div>
                    )}

                    {/* Lebanese Exposure */}
                    {bank.lebaneseExposure && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase mb-1">
                          Exposure
                        </div>
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                          <AlertTriangle className="w-3 h-3" />
                          Lebanese Exposure
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedBanks.length === 0 && (
          <div className="card-surface p-6 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200">No banks selected</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  Select at least one bank from the dropdown above to begin comparison.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
