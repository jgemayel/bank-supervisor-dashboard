import { Building2, DollarSign, TrendingUp, Shield, AlertTriangle, PieChart } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { SectorCompositionChart } from "../components/charts/SectorCompositionChart";
import { HeatmapTable } from "../components/charts/HeatmapTable";
import { banks, sectorAggregates } from "../data/banks";
import { formatSYP, formatNumber } from "../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart as RPieChart, Pie,
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
  Critical: "#991b1b",
};

export function OverviewPage() {

  const topBanks = [...banks]
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .slice(0, 5);

  const riskDistribution = [
    { name: "Low", value: banks.filter((b) => b.riskRating === "Low").length },
    { name: "Medium", value: banks.filter((b) => b.riskRating === "Medium").length },
    { name: "High", value: banks.filter((b) => b.riskRating === "High").length },
  ].filter((d) => d.value > 0);

  const auditDistribution = [
    { name: "Clean", value: sectorAggregates.cleanOpinions, color: "#10b981" },
    { name: "Qualified", value: sectorAggregates.qualifiedOpinions, color: "#ef4444" },
    { name: "Emphasis", value: sectorAggregates.emphasisOfMatter, color: "#f59e0b" },
  ];


  const alerts = [
    ...banks
      .filter((b) => b.riskRating === "High")
      .map((b) => ({
        bank: b.shortName,
        type: "high-risk" as const,
        message: `High risk - ${b.auditReason || "Multiple risk factors identified"}`,
      })),
    ...banks
      .filter((b) => b.equityToAssets < 10)
      .map((b) => ({
        bank: b.shortName,
        type: "capital" as const,
        message: `Low capitalization: E/A ratio at ${b.equityToAssets.toFixed(1)}%`,
      })),
    ...banks
      .filter((b) => b.reportingPeriod === "YE 2023")
      .map((b) => ({
        bank: b.shortName,
        type: "stale" as const,
        message: `Reporting period is YE 2023 (behind peers)`,
      })),
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Banks"
          value={sectorAggregates.totalBanks}
          subtitle={`${sectorAggregates.conventional}C / ${sectorAggregates.islamic}I / ${sectorAggregates.microfinance}MF`}
          icon={Building2}
        />
        <MetricCard
          title="Total Assets"
          value={formatSYP(sectorAggregates.totalAssets)}
          subtitle="Sector-wide"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Equity"
          value={formatSYP(sectorAggregates.totalEquity)}
          subtitle={`${sectorAggregates.wtdAvgEquityToAssets.toFixed(1)}% of assets`}
          icon={Shield}
        />
        <MetricCard
          title="Net Profit"
          value={formatSYP(sectorAggregates.totalNetProfit)}
          subtitle={`Wtd ROA: ${sectorAggregates.wtdAvgROA.toFixed(1)}%`}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Lebanese Exposure"
          value={`${sectorAggregates.lebaneseExposed} banks`}
          subtitle="Systemic risk factor"
          icon={AlertTriangle}
          className="border-red-200 bg-red-50/30"
          valueClassName="text-red-700"
        />
        <MetricCard
          title="Top 5 Concentration"
          value={`${sectorAggregates.top5Concentration}%`}
          subtitle="of total sector assets"
          icon={PieChart}
        />
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Supervisory Alerts ({alerts.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700"
              >
                <StatusBadge
                  label={alert.bank}
                  variant="custom"
                  className={
                    alert.type === "high-risk"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : alert.type === "capital"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-blue-100 text-blue-700 border-blue-200"
                  }
                />
                <span className="text-slate-600 dark:text-slate-300">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectorCompositionChart />

        {/* Risk Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Risk Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Opinions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Audit Opinion Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={auditDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {auditDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Banks Bar Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Top 5 Banks by Total Assets
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topBanks.map((b) => ({
                name: b.shortName,
                assets: b.totalAssets,
                type: b.type,
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                formatter={(value: any) => [formatSYP(value), "Total Assets"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="assets" radius={[6, 6, 0, 0]}>
                {topBanks.map((b, i) => (
                  <Cell
                    key={i}
                    fill={
                      b.type === "Conventional"
                        ? "#3b82f6"
                        : b.type === "Islamic"
                        ? "#10b981"
                        : "#f59e0b"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapTable banks={banks} />
    </div>
  );
}
