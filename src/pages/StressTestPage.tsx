import { useState } from "react";
import type { BankData } from "../types";
import { banks } from "../data/banks";
import { cn } from "../lib/utils";
import { AlertTriangle, TrendingDown, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface StressResult {
  bank: BankData;
  prStressEA: number;
  postStressEA: number;
  change: number;
  status: "good" | "caution" | "danger";
}

export function StressTestPage() {
  const [lebaneseWritedown, setLebaneseWritedown] = useState(50);
  const [rateShock, setRateShock] = useState(0);
  const [creditDeterioration, setCreditDeterioration] = useState(10);

  // Calculate stress scenario
  const calculateStressResults = (): StressResult[] => {
    return banks
      .map((bank): StressResult => {
        let stressedEquity = bank.equity;

        // Lebanese exposure write-down
        if (bank.lebaneseExposure && lebaneseWritedown > 0) {
          const estimatedLebaneseExposure = bank.totalAssets * 0.05;
          const writedownAmount =
            estimatedLebaneseExposure * (lebaneseWritedown / 100);
          stressedEquity -= writedownAmount;
        }

        // Interest rate shock impact on NII
        // Approximation: duration gap * rate change * portion of assets
        const rateImpact =
          (bank.totalAssets * (rateShock / 10000)) * 0.02;
        stressedEquity += rateImpact;

        // Credit quality deterioration (NPL increase)
        // Assumes additional NPL means equity loss due to provisions
        const creditFacilitiesNPL =
          (bank.creditFacilities * creditDeterioration) / 100;
        const nplLossGivenDefault = creditFacilitiesNPL * 0.5;
        stressedEquity -= nplLossGivenDefault;

        const prStressEA = bank.equityToAssets;
        const postStressEA = (stressedEquity / bank.totalAssets) * 100;
        const change = postStressEA - prStressEA;

        // Determine status based on post-stress E/A
        let status: "good" | "caution" | "danger" = "good";
        if (postStressEA < 10) {
          status = "danger";
        } else if (postStressEA < 15) {
          status = "caution";
        }

        return {
          bank,
          prStressEA,
          postStressEA: Math.max(0, postStressEA),
          change,
          status,
        };
      })
      .sort((a, b) => a.postStressEA - b.postStressEA);
  };

  const results = calculateStressResults();

  // Impact summary counts
  const breachingCapital = results.filter((r) => r.postStressEA < 10).length;
  const cautionZone = results.filter(
    (r) => r.postStressEA >= 10 && r.postStressEA < 15
  ).length;
  const compliant = results.filter((r) => r.postStressEA >= 15).length;

  // Pre-stress equivalent
  const preStressBreaching = banks.filter((b) => b.equityToAssets < 10).length;
  const preStressCaution = banks.filter(
    (b) => b.equityToAssets >= 10 && b.equityToAssets < 15
  ).length;
  const preStressCompliant = banks.filter((b) => b.equityToAssets >= 15).length;

  // Chart data
  const chartData = results.map((r) => ({
    shortName: r.bank.shortName,
    pre: r.prStressEA,
    post: r.postStressEA,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Scenario Controls */}
      <div className="card-surface p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
          Stress Scenario Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lebanese Exposure Write-Down */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Lebanese Exposure Write-Down
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  0% (No impact)
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {lebaneseWritedown}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lebaneseWritedown}
                onChange={(e) => setLebaneseWritedown(Number(e.target.value))}
                className="w-full h-2 bg-red-200 dark:bg-red-900/40 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                100% (Complete loss)
              </span>
            </div>
          </div>

          {/* Interest Rate Shock */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-600" />
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Interest Rate Shock
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  -300 bps
                </span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {rateShock > 0 ? "+" : ""}
                  {rateShock}
                </span>
              </div>
              <input
                type="range"
                min="-300"
                max="300"
                value={rateShock}
                onChange={(e) => setRateShock(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 dark:bg-amber-900/40 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                +300 bps
              </span>
            </div>
          </div>

          {/* Credit Quality Deterioration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-purple-600" />
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Credit Quality Deterioration
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  0% additional NPL
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {creditDeterioration}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={creditDeterioration}
                onChange={(e) => setCreditDeterioration(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 dark:bg-purple-900/40 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                30% additional NPL
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Note:</span> Scenario parameters
            update results in real-time. All banks re-evaluated against stress
            conditions.
          </p>
        </div>
      </div>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Banks Breaching Capital */}
        <div className="card-surface p-5 border-l-4 border-red-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Breaching Capital
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">
              E/A &lt; 10%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {breachingCapital}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {preStressBreaching} pre-stress
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: `${(breachingCapital / 18) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Banks in Caution Zone */}
        <div className="card-surface p-5 border-l-4 border-amber-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Caution Zone
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">
              10-15% E/A
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {cautionZone}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {preStressCaution} pre-stress
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600"
                style={{ width: `${(cautionZone / 18) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Banks Remaining Compliant */}
        <div className="card-surface p-5 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Compliant
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">
              E/A &gt;= 15%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {compliant}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {preStressCompliant} pre-stress
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600"
                style={{ width: `${(compliant / 18) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          Equity-to-Assets Ratio: Pre-Stress vs Post-Stress
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="shortName"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              label={{ value: "E/A %", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: any) => `${value.toFixed(2)}%`}
            />
            <ReferenceLine
              y={15}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ value: "Good (15%)", position: "right", fill: "#10b981", fontSize: 11 }}
            />
            <ReferenceLine
              y={10}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: "Caution (10%)", position: "right", fill: "#f59e0b", fontSize: 11 }}
            />
            <Bar dataKey="pre" fill="#3b82f6" name="Pre-Stress" opacity={0.7} />
            <Bar dataKey="post" fill="#ef4444" name="Post-Stress" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Results Table */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          Detailed Results (Sorted by Post-Stress E/A)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Bank
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Type
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Pre-Stress E/A %
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Post-Stress E/A %
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Change (bps)
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr
                  key={result.bank.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {result.bank.shortName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 inline-block">
                      {result.bank.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {result.prStressEA.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={cn(
                        "font-semibold",
                        result.status === "danger" && "text-red-600 dark:text-red-400",
                        result.status === "caution" &&
                          "text-amber-600 dark:text-amber-400",
                        result.status === "good" &&
                          "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {result.postStressEA.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={cn(
                        "font-semibold",
                        result.change < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {(result.change * 100).toFixed(0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                        result.status === "danger" &&
                          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                        result.status === "caution" &&
                          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                        result.status === "good" &&
                          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      )}
                    >
                      {result.status === "danger" && "Breach"}
                      {result.status === "caution" && "Caution"}
                      {result.status === "good" && "Compliant"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="card-surface p-4 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
          <span className="font-semibold">Methodology:</span> Lebanese exposure
          write-down assumes 5% of total assets as estimated exposure;
          interest rate shock applies simplified duration gap of 2% of assets;
          credit deterioration uses 50% loss-given-default. Results are
          illustrative and based on disclosed financial data. Actual outcomes
          depend on specific asset composition and hedging strategies.
        </p>
      </div>
    </div>
  );
}
