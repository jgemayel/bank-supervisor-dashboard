import { useState } from "react";
import { banks, sectorAggregates } from "../data/banks";
import { MetricBarChart } from "../components/charts/MetricBarChart";
import { ScatterPlotChart } from "../components/charts/ScatterPlotChart";
import { calculateHHI, cn, CHART_TOOLTIP_STYLE } from "../lib/utils";
import type { BankData } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export function AnalyticsPage() {
  const [scatterX, setScatterX] = useState<keyof BankData>("roa");
  const [scatterY, setScatterY] = useState<keyof BankData>("equityToAssets");

  const metricLabels: Record<string, string> = {
    roa: "ROA (%)",
    roe: "ROE (%)",
    equityToAssets: "Equity/Assets (%)",
    costToIncome: "Cost/Income (%)",
    loansToDeposits: "Loans/Deposits (%)",
    cashToAssets: "Cash/Assets (%)",
    sectorShare: "Sector Share (%)",
  };

  const selectableMetrics = Object.keys(metricLabels) as (keyof BankData)[];

  // Concentration analysis
  const sortedByAssets = [...banks].sort(
    (a, b) => b.totalAssets - a.totalAssets
  );
  const cumulativeData = sortedByAssets.reduce<
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

  const hhi = calculateHHI(banks);
  const hhiCategory =
    hhi > 2500 ? "Highly Concentrated" : hhi > 1500 ? "Moderately Concentrated" : "Competitive";

  // Type comparison radar
  const typeAvg = (type: string, metric: keyof BankData) => {
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
      Conventional: Math.min(100, Math.max(0, (typeAvg("Conventional", "roa") / 10) * 100)),
      Islamic: Math.min(100, Math.max(0, (typeAvg("Islamic", "roa") / 10) * 100)),
    },
    {
      metric: "ROE",
      Conventional: Math.min(100, Math.max(0, (typeAvg("Conventional", "roe") / 40) * 100)),
      Islamic: Math.min(100, Math.max(0, (typeAvg("Islamic", "roe") / 40) * 100)),
    },
    {
      metric: "Equity/Assets",
      Conventional: Math.min(100, Math.max(0, (typeAvg("Conventional", "equityToAssets") / 50) * 100)),
      Islamic: Math.min(100, Math.max(0, (typeAvg("Islamic", "equityToAssets") / 50) * 100)),
    },
    {
      metric: "Cash/Assets",
      Conventional: Math.min(100, Math.max(0, (typeAvg("Conventional", "cashToAssets") / 60) * 100)),
      Islamic: Math.min(100, Math.max(0, (typeAvg("Islamic", "cashToAssets") / 60) * 100)),
    },
    {
      metric: "Efficiency",
      Conventional: Math.min(100, Math.max(0, 100 - typeAvg("Conventional", "costToIncome"))),
      Islamic: Math.min(100, Math.max(0, 100 - typeAvg("Islamic", "costToIncome"))),
    },
  ];

  // Size distribution
  const sizeDistribution = [
    {
      range: "> 5B",
      count: banks.filter((b) => b.totalAssets > 5e9).length,
      color: "#3b82f6",
    },
    {
      range: "2B - 5B",
      count: banks.filter(
        (b) => b.totalAssets >= 2e9 && b.totalAssets <= 5e9
      ).length,
      color: "#6366f1",
    },
    {
      range: "1B - 2B",
      count: banks.filter(
        (b) => b.totalAssets >= 1e9 && b.totalAssets < 2e9
      ).length,
      color: "#8b5cf6",
    },
    {
      range: "< 1B",
      count: banks.filter((b) => b.totalAssets < 1e9).length,
      color: "#a855f7",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Market Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Market Concentration (HHI)
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {hhi.toFixed(0)}
          </p>
          <p
            className={cn(
              "text-sm font-medium mt-1",
              hhi > 2500
                ? "text-red-600 dark:text-red-400"
                : hhi > 1500
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {hhiCategory}
          </p>
          <div className="mt-4 space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Top 5 share</span>
              <span className="font-medium">
                {sectorAggregates.top5Concentration}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>HHI &lt; 1,500</span>
              <span>Competitive</span>
            </div>
            <div className="flex justify-between">
              <span>HHI 1,500-2,500</span>
              <span>Moderate</span>
            </div>
            <div className="flex justify-between">
              <span>HHI &gt; 2,500</span>
              <span>Concentrated</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 card-hover">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Cumulative Asset Concentration
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeData}
                margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
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
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Size Distribution + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 card-hover">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Bank Size Distribution (by Total Assets)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sizeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 card-hover">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Conventional vs Islamic (Avg. Metrics - Normalized 0-100)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar
                  name="Conventional"
                  dataKey="Conventional"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Islamic"
                  dataKey="Islamic"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">X Axis:</span>
          {selectableMetrics.map((m) => (
            <button
              key={`x-${m}`}
              onClick={() => setScatterX(m)}
              className={cn(
                "px-3 py-1.5 text-[11px] rounded-full font-medium transition-colors",
                scatterX === m
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Y Axis:</span>
          {selectableMetrics.map((m) => (
            <button
              key={`y-${m}`}
              onClick={() => setScatterY(m)}
              className={cn(
                "px-3 py-1.5 text-[11px] rounded-full font-medium transition-colors",
                scatterY === m
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
        <ScatterPlotChart
          banks={banks}
          xMetric={scatterX}
          yMetric={scatterY}
          title={`${metricLabels[scatterX]} vs ${metricLabels[scatterY]}`}
          xLabel={metricLabels[scatterX]}
          yLabel={metricLabels[scatterY]}
        />
      </div>

      {/* Profitability Rankings */}
      <div className="card-hover">
        <MetricBarChart
          banks={banks}
          metric="roa"
          title="Return on Assets (ROA) Ranking"
          unit="%"
          higherIsBetter={true}
          thresholds={{ good: 1.5, caution: 0.5, danger: 0 }}
          referenceLine={{ value: 1.5, label: "Int'l Best Practice" }}
        />
      </div>
    </div>
  );
}
