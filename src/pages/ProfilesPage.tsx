import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { BankData, PrudentialBenchmark } from "../types/index";
import { banks, prudentialBenchmarks } from "../data/banks";
import { lebaneseExposureData } from "../data/lebanese-exposure";
import { StatusBadge } from "../components/StatusBadge";
import {
  formatSYP,
  cn,
  getMetricStatus,
  CHART_TOOLTIP_STYLE,
} from "../lib/utils";
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Banknote,
  Landmark,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileWarning,
  Clock,
  UserCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

/* ─── Constants ─── */

const metricKeys: (keyof BankData)[] = [
  "equityToAssets",
  "roa",
  "roe",
  "costToIncome",
  "loansToDeposits",
  "cashToAssets",
];

const metricLabels: Record<string, string> = {
  equityToAssets: "Capital Adequacy",
  roa: "Return on Assets",
  roe: "Return on Equity",
  costToIncome: "Cost to Income",
  loansToDeposits: "Loans to Deposits",
  cashToAssets: "Liquidity Ratio",
};

/* ─── Helpers ─── */

const getTypeColor = (type: string) => {
  switch (type) {
    case "Conventional":
      return {
        bg: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        light: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "Islamic":
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        light: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    default:
      return {
        bg: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        light: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
      };
  }
};

const getRiskConfig = (risk: string) => {
  switch (risk) {
    case "Low":
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        icon: CheckCircle2,
        label: "Low Risk",
      };
    case "Medium":
      return {
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        icon: AlertCircle,
        label: "Medium Risk",
      };
    case "High":
      return {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/30",
        icon: AlertTriangle,
        label: "High Risk",
      };
    default:
      return {
        color: "text-red-800 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-950/40",
        icon: XCircle,
        label: "Critical",
      };
  }
};

const calculatePeerAverages = (bank: BankData, metric: keyof BankData) => {
  const peerBanks = banks.filter((b) => b.type === bank.type && b.id !== bank.id);
  if (peerBanks.length === 0) return 0;
  return (
    peerBanks.reduce((sum, b) => sum + (b[metric] as number), 0) /
    peerBanks.length
  );
};

const calculateSectorAverage = (metric: keyof BankData) => {
  return banks.reduce((sum, b) => sum + (b[metric] as number), 0) / banks.length;
};

const getAssetRank = (bank: BankData) => {
  return (
    [...banks]
      .sort((a, b) => b.totalAssets - a.totalAssets)
      .findIndex((b) => b.id === bank.id) + 1
  );
};

const normalizeMetricValue = (
  value: number,
  benchmark: PrudentialBenchmark
): number => {
  if (benchmark.higher_is_better) {
    return Math.min(
      100,
      Math.max(
        0,
        ((value - benchmark.thresholdDanger) /
          (benchmark.thresholdGood * 1.5 - benchmark.thresholdDanger)) *
          100
      )
    );
  }
  return Math.min(
    100,
    Math.max(
      0,
      ((benchmark.thresholdDanger - value) /
        (benchmark.thresholdDanger - benchmark.thresholdGood * 0.5)) *
        100
    )
  );
};

/* ─── Page Component ─── */

export function ProfilesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bankIdParam = searchParams.get("bank");
  const [selectedId, setSelectedId] = useState<number>(
    bankIdParam ? parseInt(bankIdParam) : banks[0].id
  );

  useEffect(() => {
    if (bankIdParam) setSelectedId(parseInt(bankIdParam));
  }, [bankIdParam]);

  const bank = banks.find((b) => b.id === selectedId) || banks[0];
  const bankIndex = banks.findIndex((b) => b.id === selectedId);
  const lebExposure = lebaneseExposureData.find(
    (e) => e.bankShortName === bank.shortName
  );

  const navigateBank = (dir: -1 | 1) => {
    const next = (bankIndex + dir + banks.length) % banks.length;
    const nextBank = banks[next];
    setSelectedId(nextBank.id);
    setSearchParams({ bank: nextBank.id.toString() });
  };

  /* Compute compliance scores */
  const complianceScores = prudentialBenchmarks.map((bench, i) => {
    const val = bank[metricKeys[i]] as number;
    return {
      metric: bench.metric.split("(")[0].trim(),
      key: metricKeys[i],
      value: val,
      status: getMetricStatus(
        val,
        bench.thresholdGood,
        bench.thresholdCaution,
        bench.thresholdDanger,
        bench.higher_is_better
      ),
      benchmark: bench,
    };
  });

  const goodCount = complianceScores.filter((s) => s.status === "good").length;
  const compliancePercent = Math.round(
    (goodCount / prudentialBenchmarks.length) * 100
  );

  /* Asset rank */
  const assetRank = getAssetRank(bank);

  /* Radar chart data */
  const radarData = metricKeys.map((key, i) => {
    const bench = prudentialBenchmarks[i];
    const bankVal = bank[key] as number;
    const peerVal = calculatePeerAverages(bank, key);
    return {
      metric: metricLabels[key].split("(")[0].trim().split(" ").slice(0, 2).join(" "),
      bank: normalizeMetricValue(bankVal, bench),
      peer: normalizeMetricValue(peerVal, bench),
    };
  });

  /* Bar chart data */
  const barData = metricKeys.map((key, i) => ({
    metric: complianceScores[i].metric.split(" ").slice(0, 2).join(" "),
    [bank.shortName]: Number((bank[key] as number).toFixed(2)),
    "Peer Avg": Number(calculatePeerAverages(bank, key).toFixed(2)),
    "Sector Avg": Number(calculateSectorAverage(key).toFixed(2)),
  }));

  const typeColor = getTypeColor(bank.type);
  const riskConfig = getRiskConfig(bank.riskRating);
  const RiskIcon = riskConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ─────────── BANK SELECTOR BAR ─────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateBank(-1)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Previous bank"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <select
          value={selectedId}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedId(id);
            setSearchParams({ bank: id.toString() });
          }}
          className="flex-1 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.type})
            </option>
          ))}
        </select>
        <button
          onClick={() => navigateBank(1)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Next bank"
        >
          <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* ─────────── INSTITUTION HEADER CARD ─────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border card-surface",
          typeColor.border
        )}
      >
        <div className={cn("h-1.5", typeColor.bg)} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            {/* Left: Bank Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", typeColor.light)}>
                  <Landmark className={cn("h-6 w-6", typeColor.text)} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {bank.name}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {bank.shortName}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={bank.type}
                  variant="custom"
                  className={cn(typeColor.light, typeColor.text, typeColor.border)}
                />
                <StatusBadge label={bank.riskRating} variant="risk" />
                <StatusBadge label={bank.auditOpinion} variant="audit" />
                {lebExposure && (
                  <StatusBadge
                    label="Lebanese Exposure"
                    variant="custom"
                    className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                  />
                )}
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {bank.reportingPeriod}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  {bank.auditor}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Rank #{assetRank} by assets
                </span>
              </div>
            </div>

            {/* Right: Compliance Ring + Risk */}
            <div className="flex-shrink-0 flex items-center gap-5">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${compliancePercent * 2.64} 264`}
                    className={cn(
                      compliancePercent >= 80
                        ? "text-emerald-500"
                        : compliancePercent >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      compliancePercent >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : compliancePercent >= 50
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {goodCount}/{prudentialBenchmarks.length}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    compliant
                  </span>
                </div>
              </div>
              <div className="hidden sm:block space-y-2 text-xs">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                    riskConfig.bg
                  )}
                >
                  <RiskIcon className={cn("h-4 w-4", riskConfig.color)} />
                  <span className={cn("font-semibold", riskConfig.color)}>
                    {riskConfig.label}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Market share:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {bank.sectorShare}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── FINANCIAL OVERVIEW (KPI CARDS) ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assets",
            value: formatSYP(bank.totalAssets),
            sub: `#${assetRank} in sector`,
            icon: CircleDollarSign,
            color: "blue" as const,
          },
          {
            label: "Equity",
            value: formatSYP(bank.equity),
            sub: `${bank.equityToAssets.toFixed(1)}% of assets`,
            icon: Shield,
            color: "emerald" as const,
          },
          {
            label: "Net Profit",
            value: formatSYP(bank.netProfit),
            sub: `ROA ${bank.roa.toFixed(2)}% | ROE ${bank.roe.toFixed(1)}%`,
            icon: bank.netProfit >= 0 ? TrendingUp : TrendingDown,
            color: bank.netProfit >= 0 ? ("emerald" as const) : ("red" as const),
          },
          {
            label: "Customer Deposits",
            value: formatSYP(bank.customerDeposits),
            sub: `L/D ratio ${bank.loansToDeposits.toFixed(1)}%`,
            icon: Banknote,
            color: "purple" as const,
          },
        ].map((item) => {
          const Icon = item.icon;
          const colorMap: Record<
            string,
            { iconBg: string; iconText: string; border: string }
          > = {
            blue: {
              iconBg: "bg-blue-50 dark:bg-blue-950/30",
              iconText: "text-blue-600 dark:text-blue-400",
              border: "border-l-blue-500",
            },
            emerald: {
              iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
              iconText: "text-emerald-600 dark:text-emerald-400",
              border: "border-l-emerald-500",
            },
            red: {
              iconBg: "bg-red-50 dark:bg-red-950/30",
              iconText: "text-red-600 dark:text-red-400",
              border: "border-l-red-500",
            },
            purple: {
              iconBg: "bg-purple-50 dark:bg-purple-950/30",
              iconText: "text-purple-600 dark:text-purple-400",
              border: "border-l-purple-500",
            },
          };
          const colors = colorMap[item.color];
          return (
            <div
              key={item.label}
              className={cn(
                "card-surface rounded-xl border-l-4 p-5",
                colors.border,
                "hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {item.label}
                </p>
                <div className={cn("p-1.5 rounded-lg", colors.iconBg)}>
                  <Icon className={cn("h-4 w-4", colors.iconText)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {item.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─────────── PRUDENTIAL COMPLIANCE GRID ─────────── */}
      <div className="card-surface rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Prudential Compliance Scorecard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Performance against CBS requirements and international benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          {complianceScores.map((score, i) => {
            const bench = prudentialBenchmarks[i];
            const sectorAvg = calculateSectorAverage(metricKeys[i]);
            const peerAvg = calculatePeerAverages(bank, metricKeys[i]);

            const statusStyle =
              score.status === "good"
                ? {
                    dot: "bg-emerald-500",
                    text: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/20",
                  }
                : score.status === "caution"
                  ? {
                      dot: "bg-amber-500",
                      text: "text-amber-600 dark:text-amber-400",
                      bg: "bg-amber-50 dark:bg-amber-950/20",
                    }
                  : {
                      dot: "bg-red-500",
                      text: "text-red-600 dark:text-red-400",
                      bg: "bg-red-50 dark:bg-red-950/20",
                    };

            const progressVal = bench.higher_is_better
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((score.value - bench.thresholdDanger) /
                      (bench.thresholdGood * 1.3 - bench.thresholdDanger)) *
                      100
                  )
                )
              : Math.min(
                  100,
                  Math.max(
                    0,
                    ((bench.thresholdDanger - score.value) /
                      (bench.thresholdDanger - bench.thresholdGood * 0.7)) *
                      100
                  )
                );

            return (
              <div key={i} className="p-5 space-y-3">
                {/* Title row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", statusStyle.dot)} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {metricLabels[metricKeys[i]]}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      statusStyle.bg,
                      statusStyle.text
                    )}
                  >
                    {score.status === "good"
                      ? "Pass"
                      : score.status === "caution"
                        ? "Watch"
                        : "Fail"}
                  </span>
                </div>

                {/* Big number */}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      statusStyle.text
                    )}
                  >
                    {score.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    %
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      statusStyle.dot
                    )}
                    style={{ width: `${progressVal}%` }}
                  />
                </div>

                {/* Context row */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
                      Peer
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                      {peerAvg.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
                      Sector
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                      {sectorAvg.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
                      Target
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                      {bench.higher_is_better ? "≥" : "≤"} {bench.thresholdGood}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────── ALERTS SECTION ─────────── */}
      {(lebExposure || bank.auditOpinion !== "Clean") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lebExposure && (
            <div className="flex items-start gap-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-5">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
                  Lebanese Bank Exposure
                </h3>
                <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
                  Affiliated with{" "}
                  <span className="font-semibold">
                    {lebExposure.parentAffiliation}
                  </span>
                </p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {lebExposure.provisioningStatus}
                </p>
                <StatusBadge
                  label={lebExposure.complianceStatus}
                  variant="custom"
                  className={
                    lebExposure.complianceStatus === "Non-Compliant"
                      ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 mt-1"
                      : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 mt-1"
                  }
                />
              </div>
            </div>
          )}
          {bank.auditOpinion !== "Clean" && (
            <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  Audit Finding: {bank.auditOpinion}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  {bank.auditReason}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── RADAR & BAR CHARTS ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card-surface rounded-2xl border p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Performance Profile
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Normalized scores vs {bank.type} peer average
          </p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-700"
                />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Radar
                  name={bank.shortName}
                  dataKey="bank"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Peer Avg"
                  dataKey="peer"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                  iconType="line"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card-surface rounded-2xl border p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Metric Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Bank vs peer group vs full sector averages
          </p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 10, left: 0, bottom: 50 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  className="dark:stroke-slate-800"
                />
                <XAxis
                  dataKey="metric"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: any) => [
                    `${Number(value).toFixed(1)}%`,
                    "",
                  ]}
                />
                <Bar
                  dataKey={bank.shortName}
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Peer Avg"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Sector Avg"
                  fill="#e2e8f0"
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─────────── BALANCE SHEET SUMMARY TABLE ─────────── */}
      <div className="card-surface rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Balance Sheet Snapshot
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  % of Assets
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Sector Avg %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                {
                  label: "Total Assets",
                  amount: bank.totalAssets,
                  pctOfAssets: 100,
                  sectorPct: 100,
                },
                {
                  label: "Customer Deposits",
                  amount: bank.customerDeposits,
                  pctOfAssets:
                    (bank.customerDeposits / bank.totalAssets) * 100,
                  sectorPct:
                    (banks.reduce((s, b) => s + b.customerDeposits, 0) /
                      banks.reduce((s, b) => s + b.totalAssets, 0)) *
                    100,
                },
                {
                  label: "Credit Facilities",
                  amount: bank.creditFacilities,
                  pctOfAssets:
                    (bank.creditFacilities / bank.totalAssets) * 100,
                  sectorPct:
                    (banks.reduce((s, b) => s + b.creditFacilities, 0) /
                      banks.reduce((s, b) => s + b.totalAssets, 0)) *
                    100,
                },
                {
                  label: "Cash & CBS Balances",
                  amount: bank.cashAndCBS,
                  pctOfAssets: bank.cashToAssets,
                  sectorPct: calculateSectorAverage("cashToAssets"),
                },
                {
                  label: "Equity",
                  amount: bank.equity,
                  pctOfAssets: bank.equityToAssets,
                  sectorPct: calculateSectorAverage("equityToAssets"),
                },
                {
                  label: "Net Profit",
                  amount: bank.netProfit,
                  pctOfAssets: bank.roa,
                  sectorPct: calculateSectorAverage("roa"),
                },
              ].map((row, idx) => (
                <tr
                  key={row.label}
                  className={cn(
                    "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
                    idx === 0 &&
                      "font-semibold bg-slate-50/50 dark:bg-slate-800/20"
                  )}
                >
                  <td className="py-3 px-6 text-slate-900 dark:text-slate-100">
                    {row.label}
                  </td>
                  <td className="py-3 px-6 text-right text-slate-700 dark:text-slate-200 tabular-nums font-medium">
                    {formatSYP(row.amount)}
                  </td>
                  <td className="py-3 px-6 text-right tabular-nums">
                    <span className="text-slate-600 dark:text-slate-300">
                      {row.pctOfAssets.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right tabular-nums">
                    <span className="text-slate-400 dark:text-slate-500">
                      {row.sectorPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
