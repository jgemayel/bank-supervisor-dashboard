import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { banks, prudentialBenchmarks } from "../data/banks";
import { lebaneseExposureData } from "../data/lebanese-exposure";
import { StatusBadge } from "../components/StatusBadge";
import { MetricCard } from "../components/MetricCard";
import {
  formatSYP,
  cn,
  getMetricStatus,
  getStatusColor,
} from "../lib/utils";
import type { BankData } from "../types";
import {
  DollarSign,
  Shield,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function ProfilesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bankIdParam = searchParams.get("bank");
  const [selectedId, setSelectedId] = useState<number>(
    bankIdParam ? parseInt(bankIdParam) : banks[0].id
  );

  useEffect(() => {
    if (bankIdParam) {
      setSelectedId(parseInt(bankIdParam));
    }
  }, [bankIdParam]);

  const bank = banks.find((b) => b.id === selectedId) || banks[0];
  const lebExposure = lebaneseExposureData.find(
    (e) => e.bankShortName === bank.shortName
  );

  const metricKeys: (keyof BankData)[] = [
    "equityToAssets",
    "roa",
    "roe",
    "costToIncome",
    "loansToDeposits",
    "cashToAssets",
  ];

  const complianceScores = prudentialBenchmarks.map((bench, i) => {
    const val = bank[metricKeys[i]] as number;
    return {
      metric: bench.metric.split("(")[0].trim(),
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

  const goodCount = complianceScores.filter(
    (s) => s.status === "good"
  ).length;

  // Radar data normalized
  const radarData = [
    {
      metric: "ROA",
      value: Math.min(bank.roa / 5, 1) * 100,
      raw: bank.roa,
    },
    {
      metric: "ROE",
      value: Math.min(bank.roe / 30, 1) * 100,
      raw: bank.roe,
    },
    {
      metric: "Capital",
      value: Math.min(bank.equityToAssets / 50, 1) * 100,
      raw: bank.equityToAssets,
    },
    {
      metric: "Liquidity",
      value: Math.min(bank.cashToAssets / 60, 1) * 100,
      raw: bank.cashToAssets,
    },
    {
      metric: "Efficiency",
      value: Math.max(0, (100 - bank.costToIncome) / 100) * 100,
      raw: bank.costToIncome,
    },
  ];

  // Peer comparison
  const peerBanks = banks.filter((b) => b.type === bank.type && b.id !== bank.id);
  const peerAvg = (metric: keyof BankData) => {
    if (peerBanks.length === 0) return 0;
    return (
      peerBanks.reduce((sum, b) => sum + (b[metric] as number), 0) /
      peerBanks.length
    );
  };

  const peerComparison = [
    { metric: "ROA", bank: bank.roa, peer: peerAvg("roa"), unit: "%" },
    { metric: "ROE", bank: bank.roe, peer: peerAvg("roe"), unit: "%" },
    {
      metric: "E/A",
      bank: bank.equityToAssets,
      peer: peerAvg("equityToAssets"),
      unit: "%",
    },
    {
      metric: "C/I",
      bank: bank.costToIncome,
      peer: peerAvg("costToIncome"),
      unit: "%",
    },
    {
      metric: "L/D",
      bank: bank.loansToDeposits,
      peer: peerAvg("loansToDeposits"),
      unit: "%",
    },
    {
      metric: "Cash/A",
      bank: bank.cashToAssets,
      peer: peerAvg("cashToAssets"),
      unit: "%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bank Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-slate-700">
            Select Bank:
          </label>
          <select
            value={selectedId}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedId(id);
              setSearchParams({ bank: id.toString() });
            }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[300px]"
          >
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.type})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 ml-auto">
            <StatusBadge label={bank.riskRating} variant="risk" />
            <StatusBadge label={bank.auditOpinion} variant="audit" />
            <StatusBadge
              label={bank.type}
              variant="custom"
              className="bg-blue-50 text-blue-700 border-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Bank Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{bank.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {bank.type}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {bank.reportingPeriod}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {bank.auditor}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Sector share: {bank.sectorShare}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Compliance Score</p>
            <p
              className={cn(
                "text-2xl font-bold",
                goodCount >= 5
                  ? "text-emerald-600"
                  : goodCount >= 3
                  ? "text-amber-600"
                  : "text-red-600"
              )}
            >
              {goodCount}/{prudentialBenchmarks.length}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Assets"
          value={formatSYP(bank.totalAssets)}
          icon={DollarSign}
        />
        <MetricCard
          title="Equity"
          value={formatSYP(bank.equity)}
          subtitle={`${bank.equityToAssets.toFixed(1)}% of assets`}
          icon={Shield}
        />
        <MetricCard
          title="Net Profit"
          value={formatSYP(bank.netProfit)}
          subtitle={`ROA: ${bank.roa.toFixed(1)}%`}
          icon={TrendingUp}
          trend={bank.netProfit > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Deposits"
          value={formatSYP(bank.customerDeposits)}
          subtitle={`L/D: ${bank.loansToDeposits.toFixed(1)}%`}
          icon={Building2}
        />
      </div>

      {/* Lebanese Exposure Warning */}
      {lebExposure && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                Lebanese Bank Exposure
              </h3>
              <p className="text-xs text-red-700 mt-1">
                Parent/Affiliate: {lebExposure.parentAffiliation}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Status: {lebExposure.provisioningStatus}
              </p>
              <StatusBadge
                label={lebExposure.complianceStatus}
                variant="custom"
                className={
                  lebExposure.complianceStatus === "Non-Compliant"
                    ? "bg-red-100 text-red-700 border-red-200 mt-2"
                    : "bg-amber-100 text-amber-700 border-amber-200 mt-2"
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit Info */}
      {bank.auditOpinion !== "Clean" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Audit Finding
          </h3>
          <p className="text-xs text-amber-800">{bank.auditReason}</p>
        </div>
      )}

      {/* Radar + Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Performance Radar
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar
                  name={bank.shortName}
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Peer Comparison ({bank.type} average)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={peerComparison}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="metric"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value.toFixed(1)}%`,
                    name === "bank" ? bank.shortName : "Peer Avg",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="bank" name={bank.shortName} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peer" name="Peer Avg" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance Detail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Prudential Compliance Detail
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {complianceScores.map((score, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                score.status === "good"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : score.status === "caution"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-red-200 bg-red-50/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {score.metric}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    getStatusColor(score.status)
                  )}
                >
                  {score.value.toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <p>Basel: {score.benchmark.baselStandard}</p>
                <p>Best Practice: {score.benchmark.internationalBest}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
