import { useState } from "react";
import { banks } from "../data/banks";
import { cn, formatSYP } from "../lib/utils";
import { AlertTriangle, TrendingDown, Percent, CreditCard, Activity } from "lucide-react";
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

interface StressResult {
  bankName: string;
  shortName: string;
  currentEA: number;
  postStressEA: number;
  breachesMinimum: boolean;
  equityChange: number;
  niiImpact: number;
  nplImpact: number;
}

export function StressTestPage() {
  const [lebaneseWritedown, setLebaneseWritedown] = useState(0);
  const [rateChange, setRateChange] = useState(0);
  const [additionalNPL, setAdditionalNPL] = useState(0);

  // Filter exposed banks
  const exposedBanks = banks.filter((b) => b.lebaneseExposure);

  // Calculate stress test results
  const calculateStressResults = (): StressResult[] => {
    return banks.map((bank) => {
      // Lebanese exposure write-down impact
      let equityAfterWritedown = bank.equity;
      if (bank.lebaneseExposure && lebaneseWritedown > 0) {
        // Estimate Lebanese exposure as a percentage of assets (varies by bank)
        const estimatedLebaneseExposure = bank.totalAssets * 0.05; // Conservative estimate
        const writedownAmount = estimatedLebaneseExposure * (lebaneseWritedown / 100);
        equityAfterWritedown -= writedownAmount;
      }

      // Interest rate sensitivity impact on NII
      const sensitivityDuration = (bank.creditFacilities - bank.customerDeposits) * 0.01;
      const niiImpact = (rateChange / 100) * sensitivityDuration;
      equityAfterWritedown += niiImpact;

      // NPL impact on equity
      const nplImpactAmount = (additionalNPL / 100) * bank.creditFacilities;
      equityAfterWritedown -= nplImpactAmount;

      const postStressEA = (equityAfterWritedown / bank.totalAssets) * 100;
      const breachesMinimum = postStressEA < 15;

      return {
        bankName: bank.name,
        shortName: bank.shortName,
        currentEA: bank.equityToAssets,
        postStressEA: Math.max(0, postStressEA),
        breachesMinimum,
        equityChange: equityAfterWritedown - bank.equity,
        niiImpact,
        nplImpact: -nplImpactAmount,
      };
    });
  };

  const stressResults = calculateStressResults();

  // Prepare chart data
  const chartData = stressResults.map((result) => ({
    shortName: result.shortName,
    current: result.currentEA,
    stressed: result.postStressEA,
  }));

  // Prepare rate sensitivity chart
  const rateSensitivityData = stressResults.map((result) => ({
    shortName: result.shortName,
    niiImpact: result.niiImpact,
    benefit: result.niiImpact > 0 ? "Benefits" : "Suffers",
  }));

  // Prepare NPL impact chart
  const nplImpactData = stressResults.map((result) => ({
    shortName: result.shortName,
    nplImpact: result.nplImpact,
  }));

  // Get color for E/A ratio
  const getEARatioColor = (ratio: number): string => {
    if (ratio >= 15) return "text-emerald-600 bg-emerald-50";
    if (ratio >= 10) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getEARatioBgColor = (ratio: number): string => {
    if (ratio >= 15) return "bg-emerald-500";
    if (ratio >= 10) return "bg-amber-500";
    return "bg-red-500";
  };

  // Count banks by status
  const breachCount = stressResults.filter((r) => r.breachesMinimum).length;
  const goodCount = stressResults.filter(
    (r) => !r.breachesMinimum && r.postStressEA >= 15
  ).length;
  const cautionCount = stressResults.filter(
    (r) => !r.breachesMinimum && r.postStressEA < 15 && r.postStressEA >= 10
  ).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Scenario Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lebanese Exposure Write-Down */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Lebanese Exposure Write-Down</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Write-down %</label>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{lebaneseWritedown.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lebaneseWritedown}
                onChange={(e) => setLebaneseWritedown(Number(e.target.value))}
                className="w-full h-2 bg-red-100 dark:bg-red-900/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 border border-red-100 dark:border-red-900/50">
              <p className="text-xs text-red-700 dark:text-red-400">
                <strong>Affected Banks:</strong> {exposedBanks.map((b) => b.shortName).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Interest Rate Sensitivity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Interest Rate Sensitivity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate Change (bps)</label>
                <span className={cn(
                  "text-lg font-bold",
                  rateChange > 0 ? "text-green-600 dark:text-green-400" : rateChange < 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"
                )}>
                  {rateChange > 0 ? "+" : ""}{(rateChange / 100).toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min="-500"
                max="500"
                value={rateChange}
                onChange={(e) => setRateChange(Number(e.target.value))}
                className="w-full h-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Impact:</strong> Rate increase benefits net interest income if asset-sensitive
              </p>
            </div>
          </div>
        </div>

        {/* Credit Quality Deterioration */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Credit Quality Deterioration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional NPL Rate</label>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{additionalNPL.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={additionalNPL}
                onChange={(e) => setAdditionalNPL(Number(e.target.value))}
                className="w-full h-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-100 dark:border-amber-900/50">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Impact:</strong> Additional NPL reduces equity via loan loss provisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Compliant Banks</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{goodCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{"E/A >= 15% minimum"}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase">Caution Zone</span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{cautionCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">E/A 10-15%</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase">Breach Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{breachCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{"E/A < 10%"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* E/A Ratio Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Equity-to-Assets Ratio Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="shortName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: "E/A %", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: any) => `${Number(value).toFixed(1)}%`}
              />
              <ReferenceLine y={15} stroke="#10b981" strokeDasharray="5 5" label="Min Required (15%)" />
              <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" label="Caution (10%)" />
              <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[8, 8, 0, 0]} />
              <Bar dataKey="stressed" fill="#ef4444" name="Post-Stress" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interest Rate Sensitivity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Interest Rate Sensitivity (NII Impact)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rateSensitivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="shortName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: "NII Impact", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: any) => `${formatSYP(Number(value))}`}
              />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Bar dataKey="niiImpact" radius={[8, 8, 0, 0]}>
                {rateSensitivityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.niiImpact > 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NPL Impact Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">NPL Impact on Equity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={nplImpactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="shortName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: "Equity Impact", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
              formatter={(value: any) => `${formatSYP(Number(value))}`}
            />
            <ReferenceLine y={0} stroke="#6b7280" />
            <Bar dataKey="nplImpact" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Results Summary Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Stress Test Results Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Bank</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Current E/A</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Post-Stress E/A</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Change</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Capital Breach</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {stressResults.map((result, idx) => {
                const currentBank = banks.find((b) => b.shortName === result.shortName);
                const isExposed = currentBank?.lebaneseExposure;

                return (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                      <div>
                        <div className="font-semibold">{result.shortName}</div>
                        {isExposed && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">Lebanese Exposed</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {result.currentEA.toFixed(1)}%
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-semibold",
                      getEARatioColor(result.postStressEA)
                    )}>
                      {result.postStressEA.toFixed(1)}%
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-semibold",
                      result.postStressEA - result.currentEA < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {result.postStressEA - result.currentEA > 0 ? "+" : ""}
                      {(result.postStressEA - result.currentEA).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-semibold",
                        result.breachesMinimum
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {result.breachesMinimum ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-3 rounded-full flex-shrink-0",
                          getEARatioBgColor(result.postStressEA)
                        )} style={{ width: "12px" }}></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {result.postStressEA >= 15
                            ? "Compliant"
                            : result.postStressEA >= 10
                            ? "Caution"
                            : "At Risk"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Compliant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{"E/A >= 15% (minimum requirement)"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-amber-500 flex-shrink-0 mt-1"></div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Caution Zone</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">E/A 10-15% (elevated risk)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0 mt-1"></div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">At Risk</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{"E/A < 10% (breach potential)"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Notes */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-900/50 p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Stress Test Methodology</h3>
        <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
          <p>
            <strong>Lebanese Exposure Write-Down:</strong> Reduces equity by estimated Lebanese exposure (5% of assets) times the write-down percentage. Applies only to exposed banks: BSFF, BSO, ATB, Fransa, Shahba.
          </p>
          <p>
            <strong>Interest Rate Sensitivity:</strong> NII impact calculated as (rate change × asset-liability gap × 0.01). Positive values indicate benefit from rate increases for asset-sensitive banks.
          </p>
          <p>
            <strong>Credit Quality Deterioration:</strong> Additional NPL reduces equity by (additional NPL rate × credit facilities). Represents provisioning requirements for new non-performing loans.
          </p>
          <p>
            <strong>Capital Ratio:</strong> Calculated as post-stress equity / total assets. Minimum CBS requirement is 15% for capital adequacy. Ratios below 10% indicate acute risk.
          </p>
        </div>
      </div>
    </div>
  );
}
