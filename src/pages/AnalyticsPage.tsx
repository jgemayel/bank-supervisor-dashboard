import { useState } from "react";
import type { BankData } from "../types/index";
import { banks, sectorAggregates } from "../data/banks";
import {
  calculateHHI,
  cn,
  formatNumber,
  getBankTypeColor,
  CHART_TOOLTIP_STYLE,
  CHART_COLORS,
} from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * AnalyticsPage - Professional supervisory analytics dashboard
 * 
 * Sections:
 * 1. Market Concentration Analysis (HHI + cumulative share area chart)
 * 2. Size Distribution (horizontal bar chart by asset tier)
 * 3. Risk-Return Scatter (ROA vs Equity/Assets, colored by type)
 * 4. Bank Type Comparison (radar chart)
 * 5. Performance Rankings (sortable table)
 */
export function AnalyticsPage() {
  const [rankingSort, setRankingSort] = useState<"roa" | "roe" | "efficiency">(
    "roa"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // ============================================================================
  // SECTION 1: MARKET CONCENTRATION ANALYSIS
  // ============================================================================

  const hhi = calculateHHI(banks);
  const hhiCategory =
    hhi > 2500
      ? "Highly Concentrated"
      : hhi > 1500
        ? "Moderately Concentrated"
        : "Competitive";

  const hhiColor =
    hhi > 2500
      ? "text-red-600"
      : hhi > 1500
        ? "text-amber-600"
        : "text-emerald-600";

  // Calculate cumulative concentration
  const sortedByAssets = [...banks].sort(
    (a, b) => b.totalAssets - a.totalAssets
  );
  const concentrationData = sortedByAssets.reduce<
    { name: string; cumulative: number; individual: number }[]
  >((acc, bank, i) => {
    const prev = i > 0 ? acc[i - 1].cumulative : 0;
    acc.push({
      name: bank.shortName,
      cumulative: prev + bank.sectorShare,
      individual: bank.sectorShare,
    });
    return acc;
  }, []);

  // ============================================================================
  // SECTION 2: SIZE DISTRIBUTION (by asset tier)
  // ============================================================================

  const sizeDistribution = [
    {
      tier: "> 5B SYP",
      count: banks.filter((b) => b.totalAssets > 5e9).length,
      color: "#3b82f6",
    },
    {
      tier: "2-5B SYP",
      count: banks.filter(
        (b) => b.totalAssets >= 2e9 && b.totalAssets < 5e9
      ).length,
      color: "#6366f1",
    },
    {
      tier: "1-2B SYP",
      count: banks.filter(
        (b) => b.totalAssets >= 1e9 && b.totalAssets < 2e9
      ).length,
      color: "#8b5cf6",
    },
    {
      tier: "< 1B SYP",
      count: banks.filter((b) => b.totalAssets < 1e9).length,
      color: "#a855f7",
    },
  ];

  // ============================================================================
  // SECTION 3: RISK-RETURN SCATTER (ROA vs Equity/Assets)
  // ============================================================================

  const scatterData = banks.map((b) => ({
    name: b.shortName,
    roa: b.roa,
    equityToAssets: b.equityToAssets,
    assets: b.totalAssets,
    type: b.type,
    fill: getBankTypeColor(b.type),
  }));

  // Calculate quadrant lines
  const avgROA = banks.reduce((sum, b) => sum + b.roa, 0) / banks.length;
  const avgEquityToAssets =
    banks.reduce((sum, b) => sum + b.equityToAssets, 0) / banks.length;

  // ============================================================================
  // SECTION 4: BANK TYPE COMPARISON (Radar Chart)
  // ============================================================================

  const typeAverage = (type: string, metric: keyof BankData): number => {
    const typeBanks = banks.filter((b) => b.type === type);
    if (typeBanks.length === 0) return 0;
    return (
      typeBanks.reduce((sum, b) => sum + (b[metric] as number), 0) /
      typeBanks.length
    );
  };

  const radarData = [
    {
      metric: "ROA",
      Conventional: Math.min(
        100,
        Math.max(0, (typeAverage("Conventional", "roa") / 10) * 100)
      ),
      Islamic: Math.min(
        100,
        Math.max(0, (typeAverage("Islamic", "roa") / 10) * 100)
      ),
    },
    {
      metric: "ROE",
      Conventional: Math.min(
        100,
        Math.max(0, (typeAverage("Conventional", "roe") / 40) * 100)
      ),
      Islamic: Math.min(
        100,
        Math.max(0, (typeAverage("Islamic", "roe") / 40) * 100)
      ),
    },
    {
      metric: "Capital",
      Conventional: Math.min(
        100,
        Math.max(
          0,
          (typeAverage("Conventional", "equityToAssets") / 50) * 100
        )
      ),
      Islamic: Math.min(
        100,
        Math.max(0, (typeAverage("Islamic", "equityToAssets") / 50) * 100)
      ),
    },
    {
      metric: "Liquidity",
      Conventional: Math.min(
        100,
        Math.max(0, (typeAverage("Conventional", "cashToAssets") / 60) * 100)
      ),
      Islamic: Math.min(
        100,
        Math.max(0, (typeAverage("Islamic", "cashToAssets") / 60) * 100)
      ),
    },
    {
      metric: "Efficiency",
      Conventional: Math.min(
        100,
        Math.max(0, 100 - typeAverage("Conventional", "costToIncome"))
      ),
      Islamic: Math.min(
        100,
        Math.max(0, 100 - typeAverage("Islamic", "costToIncome"))
      ),
    },
  ];

  // ============================================================================
  // SECTION 5: PERFORMANCE RANKINGS
  // ============================================================================

  const getRankingData = (metric: "roa" | "roe" | "efficiency") => {
    let sorted = [...banks];

    if (metric === "roa") {
      sorted.sort((a, b) => b.roa - a.roa);
    } else if (metric === "roe") {
      sorted.sort((a, b) => b.roe - a.roe);
    } else if (metric === "efficiency") {
      sorted.sort((a, b) => a.costToIncome - b.costToIncome); // Lower is better
    }

    if (sortDirection === "asc") {
      sorted.reverse();
    }

    return sorted;
  };

  const rankingData = getRankingData(rankingSort);

  const getRankingValue = (bank: BankData, metric: "roa" | "roe" | "efficiency") => {
    if (metric === "roa") return bank.roa;
    if (metric === "roe") return bank.roe;
    return bank.costToIncome;
  };

  const getRankingLabel = (metric: "roa" | "roe" | "efficiency") => {
    if (metric === "roa") return "ROA (%)";
    if (metric === "roe") return "ROE (%)";
    return "Cost/Income (%)";
  };

  const getRankingColor = (bank: BankData, metric: "roa" | "roe" | "efficiency") => {
    const value = getRankingValue(bank, metric);

    if (metric === "roa") {
      if (value >= 3) return "text-emerald-600";
      if (value >= 1) return "text-amber-600";
      return "text-red-600";
    } else if (metric === "roe") {
      if (value >= 15) return "text-emerald-600";
      if (value >= 8) return "text-amber-600";
      return "text-red-600";
    } else {
      // Cost/Income - lower is better
      if (value <= 45) return "text-emerald-600";
      if (value <= 65) return "text-amber-600";
      return "text-red-600";
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      {/* ====================================================================
          SECTION 1: MARKET CONCENTRATION ANALYSIS
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HHI Card */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Market Concentration (HHI)
            </h3>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>

          <div className={cn("text-4xl font-bold mb-2", hhiColor)}>
            {hhi.toFixed(0)}
          </div>

          <p className={cn("text-sm font-medium mb-4", hhiColor)}>
            {hhiCategory}
          </p>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between">
              <span>Top 5 Cumulative Share</span>
              <span className="font-medium">
                {sectorAggregates.top5Concentration}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>HHI Interpretation</span>
              <span className="text-right text-[10px]">
                {'<'}1500: Competitive
                <br />
                1500-2500: Moderate
                <br />
                {'>'}2500: Concentrated
              </span>
            </div>
          </div>
        </div>

        {/* Cumulative Concentration Chart */}
        <div className="lg:col-span-2 card-surface p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Cumulative Asset Concentration
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={concentrationData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="concentrationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3b82f6"
                  fill="url(#concentrationGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECTION 2: SIZE DISTRIBUTION
          ==================================================================== */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Bank Size Distribution (Total Assets Tiers)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sizeDistribution}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 90, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                type="category"
                dataKey="tier"
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                {sizeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {sizeDistribution.map((item) => (
            <div key={item.tier} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {item.tier}: {item.count} banks
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          SECTION 3 & 4: RISK-RETURN SCATTER + BANK TYPE COMPARISON
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk-Return Scatter */}
        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Risk-Return Profile (ROA vs Equity/Assets)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Bubble size represents total assets. Dot color indicates bank type.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 60, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="roa"
                  name="ROA (%)"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{ value: "ROA (%)", position: "insideBottomRight", offset: -10, fontSize: 12 }}
                />
                <YAxis
                  dataKey="equityToAssets"
                  name="Equity/Assets (%)"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{ value: "Equity/Assets (%)", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <ZAxis dataKey="assets" name="Assets" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: any, name: any) => {
                    if (name === "Assets") return [formatNumber(value), name];
                    return [value.toFixed(1), name];
                  }}
                />

                {/* Quadrant reference lines */}
                <line
                  x1={avgROA}
                  y1={0}
                  x2={avgROA}
                  y2={100}
                  stroke="#d1d5db"
                  strokeDasharray="5 5"
                />
                <line
                  x1={0}
                  y1={avgEquityToAssets}
                  x2={15}
                  y2={avgEquityToAssets}
                  stroke="#d1d5db"
                  strokeDasharray="5 5"
                />

                {/* Scatter plots by type */}
                <Scatter
                  name="Conventional"
                  data={scatterData.filter((d) => d.type === "Conventional")}
                  fill={CHART_COLORS.conventional}
                  fillOpacity={0.7}
                />
                <Scatter
                  name="Islamic"
                  data={scatterData.filter((d) => d.type === "Islamic")}
                  fill={CHART_COLORS.islamic}
                  fillOpacity={0.7}
                />
                <Scatter
                  name="Microfinance"
                  data={scatterData.filter((d) => d.type === "Microfinance")}
                  fill={CHART_COLORS.microfinance}
                  fillOpacity={0.7}
                />

                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>
              <strong>Avg ROA:</strong> {avgROA.toFixed(1)}% (vertical line)
            </p>
            <p>
              <strong>Avg Equity/Assets:</strong> {avgEquityToAssets.toFixed(1)}% (horizontal line)
            </p>
          </div>
        </div>

        {/* Bank Type Comparison Radar */}
        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Bank Type Comparison (Normalized Metrics 0-100)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  domain={[0, 100]}
                />
                <Radar
                  name="Conventional"
                  dataKey="Conventional"
                  stroke={CHART_COLORS.conventional}
                  fill={CHART_COLORS.conventional}
                  fillOpacity={0.25}
                />
                <Radar
                  name="Islamic"
                  dataKey="Islamic"
                  stroke={CHART_COLORS.islamic}
                  fill={CHART_COLORS.islamic}
                  fillOpacity={0.25}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECTION 5: PERFORMANCE RANKINGS TABLE
          ==================================================================== */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Performance Rankings
          </h3>
          <div className="flex items-center gap-2">
            {(["roa", "roe", "efficiency"] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => {
                  if (rankingSort === metric) {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setRankingSort(metric);
                    setSortDirection("desc");
                  }
                }}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                  rankingSort === metric
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                )}
              >
                {metric === "roa" ? "ROA" : metric === "roe" ? "ROE" : "Efficiency"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  Rank
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  Bank
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  Type
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  {getRankingLabel(rankingSort)}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  Δ Metric
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((bank, idx) => {
                const value = getRankingValue(bank, rankingSort);
                const prevValue =
                  idx > 0 ? getRankingValue(rankingData[idx - 1], rankingSort) : null;
                const delta = prevValue !== null ? value - prevValue : null;
                const isImproving = rankingSort === "efficiency" ? delta! < 0 : delta! > 0;

                return (
                  <tr
                    key={bank.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {bank.shortName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded-full font-medium",
                          bank.type === "Conventional"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : bank.type === "Islamic"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {bank.type}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-semibold",
                        getRankingColor(bank, rankingSort)
                      )}
                    >
                      {value.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs">
                      {delta !== null ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            isImproving
                              ? "text-emerald-600"
                              : rankingSort === "efficiency"
                                ? "text-emerald-600"
                                : "text-red-600"
                          )}
                        >
                          {isImproving ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(delta).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
