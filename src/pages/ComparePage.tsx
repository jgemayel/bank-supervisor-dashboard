import { useState, useMemo } from "react";
import { banks, prudentialBenchmarks } from "../data/banks";
import { StatusBadge } from "../components/StatusBadge";
import { cn, formatSYP } from "../lib/utils";
import type { BankData } from "../types";
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
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  AlertTriangle,
  Shield,
  CheckCircle,
} from "lucide-react";

// Color palette for banks
const BANK_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export function ComparePage() {
  // Sort banks by total assets and get top 3 as defaults
  const sortedByAssets = useMemo(
    () => [...banks].sort((a, b) => (b.totalAssets || 0) - (a.totalAssets || 0)),
    []
  );

  const defaultBanks = [sortedByAssets[0], sortedByAssets[1], sortedByAssets[2]].map(
    (b) => b.id
  );

  const [selectedBankIds, setSelectedBankIds] = useState<number[]>(defaultBanks);

  // Get selected bank data
  const selectedBanks = useMemo(
    () =>
      selectedBankIds
        .map((id) => banks.find((b) => b.id === id))
        .filter((b): b is BankData => b !== undefined),
    [selectedBankIds]
  );

  // Calculate metrics for bar chart with sector average
  const comparisonData = useMemo(() => {
    if (selectedBanks.length === 0) return [];

    const metrics = [
      { key: "roa", label: "ROA (%)" },
      { key: "roe", label: "ROE (%)" },
      { key: "equityToAssets", label: "E/A (%)" },
      { key: "costToIncome", label: "C/I (%)" },
      { key: "loansToDeposits", label: "L/D (%)" },
      { key: "cashToAssets", label: "Cash/Assets (%)" },
    ];

    // Calculate sector averages
    const sectorAverages: Record<string, number> = {};
    metrics.forEach((metric) => {
      const values = banks
        .map((b) => b[metric.key as keyof BankData] as number)
        .filter((v): v is number => typeof v === "number" && !isNaN(v));
      sectorAverages[metric.key] = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
    });

    return metrics.map((metric) => {
      const dataPoint: Record<string, any> = {
        name: metric.label,
        sectorAvg: parseFloat(sectorAverages[metric.key].toFixed(2)),
      };

      selectedBanks.forEach((bank) => {
        const value = bank[metric.key as keyof BankData] as number;
        dataPoint[bank.shortName] = value !== undefined ? parseFloat(value.toFixed(2)) : 0;
      });

      return dataPoint;
    });
  }, [selectedBanks]);

  // Calculate normalized radar data (0-100 scale)
  const radarData = useMemo(() => {
    if (selectedBanks.length === 0) return [];

    const normalizeMetric = (
      value: number | undefined,
      metric: string
    ): number => {
      if (value === undefined || isNaN(value)) return 0;

      // Different normalization strategies based on metric
      switch (metric) {
        case "roa":
        case "roe":
          // Higher is better, cap at 20%
          return Math.min((value / 20) * 100, 100);
        case "equityToAssets":
          // Higher is better, cap at 30%
          return Math.min((value / 30) * 100, 100);
        case "costToIncome":
          // Lower is better, invert (100 - normalized)
          return Math.max(0, 100 - (value / 100) * 100);
        case "loansToDeposits":
          // Lower is better for prudence, optimal around 75%
          return value > 75 ? Math.max(0, 100 - (value - 75)) : value * 1.33;
        case "cashToAssets":
          // Higher is better, cap at 20%
          return Math.min((value / 20) * 100, 100);
        case "npl":
          // Lower is better, invert
          return Math.max(0, 100 - (value * 100) / 5);
        default:
          return 0;
      }
    };

    const metrics = ["roa", "roe", "equityToAssets", "costToIncome", "loansToDeposits", "cashToAssets"];
    const labels: Record<string, string> = {
      roa: "ROA",
      roe: "ROE",
      equityToAssets: "Capital",
      costToIncome: "Efficiency",
      loansToDeposits: "Stability",
      cashToAssets: "Liquidity",
    };

    return metrics.map((metric) => {
      const dataPoint: Record<string, any> = {
        subject: labels[metric],
      };

      selectedBanks.forEach((bank) => {
        const value = bank[metric as keyof BankData] as number;
        dataPoint[bank.shortName] = normalizeMetric(value, metric);
      });

      return dataPoint;
    });
  }, [selectedBanks]);

  // Calculate performance ranking for KPI cards
  const getPerformanceColor = (
    value: number | undefined,
    metric: string
  ): string => {
    if (value === undefined) return "bg-gray-100 text-gray-700";

    const allValues = selectedBanks
      .map((b) => b[metric as keyof BankData] as number)
      .filter((v): v is number => typeof v === "number");

    if (allValues.length === 0) return "bg-gray-100 text-gray-700";

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    // Higher is better metrics
    if (["roa", "roe", "equityToAssets", "cashToAssets"].includes(metric)) {
      if (value === max) return "bg-green-100 text-green-700";
      if (value === min) return "bg-red-100 text-red-700";
      return "bg-yellow-100 text-yellow-700";
    }

    // Lower is better metrics
    if (["costToIncome", "loansToDeposits"].includes(metric)) {
      if (value === min) return "bg-green-100 text-green-700";
      if (value === max) return "bg-red-100 text-red-700";
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const handleBankChange = (index: number, bankId: number) => {
    const newSelection = [...selectedBankIds];
    newSelection[index] = bankId;
    setSelectedBankIds(newSelection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 animate-fade-in-up">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Bank Comparison</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Compare financial metrics and performance across Lebanese banks
          </p>
        </div>

        {/* Bank Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Select Banks to Compare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Bank {index + 1}
                </label>
                <select
                  value={selectedBankIds[index] || ""}
                  onChange={(e) => handleBankChange(index, parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                >
                  <option value="">Select a bank</option>
                  {sortedByAssets.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {selectedBanks.length > 0 && (
          <>
            {/* KPI Cards */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Key Financial Indicators
              </h2>
              <div className="space-y-6">
                {/* Total Assets */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Total Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className={cn(
                          "p-4 rounded-lg border-2",
                          getPerformanceColor(bank.totalAssets, "totalAssets")
                        )}
                      >
                        <div className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          {bank.shortName}
                        </div>
                        <div className="text-2xl font-bold mt-2 dark:text-slate-100">
                          {formatSYP(bank.totalAssets || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Equity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className={cn(
                          "p-4 rounded-lg border-2",
                          getPerformanceColor(bank.equity, "equityToAssets")
                        )}
                      >
                        <div className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          {bank.shortName}
                        </div>
                        <div className="text-2xl font-bold mt-2 dark:text-slate-100">
                          {formatSYP(bank.equity || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net Profit */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Net Profit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className={cn(
                          "p-4 rounded-lg border-2",
                          getPerformanceColor(bank.netProfit, "roa")
                        )}
                      >
                        <div className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          {bank.shortName}
                        </div>
                        <div className="text-2xl font-bold mt-2 dark:text-slate-100">
                          {formatSYP(bank.netProfit || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Deposits */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Customer Deposits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className={cn(
                          "p-4 rounded-lg border-2",
                          getPerformanceColor(bank.customerDeposits, "loansToDeposits")
                        )}
                      >
                        <div className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          {bank.shortName}
                        </div>
                        <div className="text-2xl font-bold mt-2 dark:text-slate-100">
                          {formatSYP(bank.customerDeposits || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Bar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Performance Metrics Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                    }}
                    formatter={(value) =>
                      typeof value === "number" ? value.toFixed(2) : value
                    }
                  />
                  <Legend />
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

            {/* Radar Chart Comparison */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Normalized Performance Profile
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                All metrics normalized to 0-100 scale for direct comparison
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#cbd5e1" />
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
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance Comparison */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Prudential Compliance
              </h2>
              <div className="space-y-6">
                {[
                  {
                    label: "Capital Adequacy (E/A)",
                    benchmark: prudentialBenchmarks[0],
                    getter: (b: BankData) => b.equityToAssets,
                  },
                  {
                    label: "Loan-to-Deposit Ratio",
                    benchmark: prudentialBenchmarks[4],
                    getter: (b: BankData) => b.loansToDeposits,
                  },
                  {
                    label: "Cost-to-Income Ratio",
                    benchmark: prudentialBenchmarks[3],
                    getter: (b: BankData) => b.costToIncome,
                  },
                  {
                    label: "Liquidity (Cash/Assets)",
                    benchmark: prudentialBenchmarks[5],
                    getter: (b: BankData) => b.cashToAssets,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        {item.label}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Target: {item.benchmark.higher_is_better ? `≥ ${item.benchmark.thresholdGood}%` : `≤ ${item.benchmark.thresholdGood}%`}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedBanks.map((bank) => {
                        const value = item.getter(bank);
                        const isCompliant =
                          value !== undefined &&
                          (item.benchmark.higher_is_better
                            ? value >= item.benchmark.thresholdGood
                            : value <= item.benchmark.thresholdGood);

                        return (
                          <div
                            key={bank.id}
                            className={cn(
                              "p-4 rounded-lg border-2",
                              isCompliant
                                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-900/50"
                                : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-900/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                  {bank.shortName}
                                </div>
                                <div className="text-lg font-bold mt-1 dark:text-slate-100">
                                  {value?.toFixed(2)}%
                                </div>
                              </div>
                              <div>
                                {isCompliant ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <AlertTriangle className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Profile Cards */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Bank Profiles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="border-2 border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {bank.shortName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{bank.type}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Audit Opinion */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                          Audit Opinion
                        </div>
                        <div className="mt-1">
                          <StatusBadge
                            variant={
                              bank.auditOpinion === "Clean"
                                ? "audit"
                                : bank.auditOpinion === "Qualified"
                                  ? "audit"
                                  : "risk"
                            }
                            label={bank.auditOpinion || "N/A"}
                          />
                        </div>
                      </div>

                      {/* Risk Rating */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                          Risk Rating
                        </div>
                        <div className="mt-1">
                          <StatusBadge
                            variant={
                              bank.riskRating === "Low"
                                ? "custom"
                                : bank.riskRating === "Medium"
                                  ? "custom"
                                  : "risk"
                            }
                            label={bank.riskRating || "N/A"}
                          />
                        </div>
                      </div>

                      {/* Auditor */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                          Auditor
                        </div>
                        <p className="text-sm text-gray-900 dark:text-slate-100 mt-1">
                          {bank.auditor || "N/A"}
                        </p>
                      </div>

                      {/* Reporting Period */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                          Reporting Period
                        </div>
                        <p className="text-sm text-gray-900 dark:text-slate-100 mt-1">
                          {bank.reportingPeriod || "N/A"}
                        </p>
                      </div>

                      {/* Lebanese Exposure */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase">
                          Lebanese Exposure
                        </div>
                        <div className="mt-1">
                          {bank.lebaneseExposure ? (
                            <div className="flex items-center text-sm text-orange-600 font-medium">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              High Exposure
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-green-600 font-medium">
                              <Shield className="w-4 h-4 mr-2" />
                              Limited Exposure
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedBanks.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-900/50 p-6 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  No banks selected
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Please select at least one bank to view comparison data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
