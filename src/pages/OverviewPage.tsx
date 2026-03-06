import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { banks, sectorAggregates, prudentialBenchmarks } from "../data/banks";
import {
  formatSYP,
  formatPercent,
  getMetricStatus,
  calculateHHI,
} from "../lib/utils";


/**
 * Command Center - Top-tier supervisory monitoring dashboard
 * 
 * Designed for CBS supervisors' morning briefing with:
 * - Maximum data density (every pixel meaningful)
 * - Traffic-light color coding (green/amber/red)
 * - Functional, no decorative elements
 * - Dark mode support
 */
export function OverviewPage() {
  // ============================================================================
  // SECTION 1: SECTOR HEALTH SCORECARD (4 KPI tiles)
  // ============================================================================

  const qualifiedOpinionColor =
    sectorAggregates.qualifiedOpinions > 0 ? "text-red-600" : "text-emerald-600";
  return (
    <div className="space-y-6 animate-enter">
      {/* ====================================================================
          SECTOR HEALTH SCORECARD - 4 compact KPI tiles
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tile 1: Total Assets */}
        <div className="card-surface p-4 border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <div className="metric-label">Total Sector Assets</div>
          <div className="metric-value mt-2">
            {formatSYP(sectorAggregates.totalAssets)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sectorAggregates.totalBanks} banks
          </div>
        </div>

        {/* Tile 2: Weighted ROA */}
        <div className="card-surface p-4 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
          <div className="metric-label">Weighted Avg ROA</div>
          <div className="metric-value mt-2 text-emerald-600">
            {formatPercent(sectorAggregates.wtdAvgROA)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Profitability benchmark
          </div>
        </div>

        {/* Tile 3: Equity/Assets Ratio */}
        <div className="card-surface p-4 border-l-4 border-l-amber-500 dark:border-l-amber-400">
          <div className="metric-label">Capital Adequacy</div>
          <div className="metric-value mt-2 text-amber-600">
            {formatPercent(sectorAggregates.wtdAvgEquityToAssets)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equity/Assets ratio
          </div>
        </div>

        {/* Tile 4: Qualified Opinions (RED ALERT if any) */}
        <div
          className={`card-surface p-4 border-l-4 border-l-red-500 dark:border-l-red-400`}
        >
          <div className="metric-label">Non-Clean Opinions</div>
          <div className={`metric-value mt-2 ${qualifiedOpinionColor}`}>
            {sectorAggregates.qualifiedOpinions +
              sectorAggregates.emphasisOfMatter}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sectorAggregates.qualifiedOpinions} qualified,{" "}
            {sectorAggregates.emphasisOfMatter} EOM
          </div>
        </div>
      
        {/* Tile 5: NPL Coverage */}
        {(() => {
          const banksWithNPL = banks.filter((b) => b.nplRatio !== null);
          const avgNPL = banksWithNPL.length > 0 ? banksWithNPL.reduce((s, b) => s + (b.nplRatio ?? 0), 0) / banksWithNPL.length : 0;
          const nplColor = avgNPL > 10 ? "text-red-600" : avgNPL > 5 ? "text-amber-600" : "text-emerald-600";
          return (
            <div className="card-surface p-4 border-l-4 border-l-purple-500 dark:border-l-purple-400">
              <div className="metric-label">Avg NPL Ratio</div>
              <div className={`metric-value mt-2 ${nplColor}`}>
                {avgNPL.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {banksWithNPL.length} of {banks.length} reporting
              </div>
            </div>
          );
        })()}
</div>

      {/* ====================================================================
          ACTIVE SUPERVISORY ACTIONS (Left 60%) + SECTOR SNAPSHOT (Right 40%)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Active Supervisory Actions Panel (60%) */}
        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Active Supervisory Actions
            </h2>
          </div>

          <div className="space-y-4">
            {/* CRITICAL ISSUES */}
            {(() => {
              const criticalIssues = [
                ...banks
                  .filter((b) => b.riskRating === "Critical")
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Critical Risk Rating",
                    description: `Immediate intervention required`,
                    severity: "Critical" as const,
                  })),
                ...banks
                  .filter((b) => b.auditOpinion === "Qualified")
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Qualified Audit Opinion",
                    description: b.auditReason.substring(0, 50) + "...",
                    severity: "Critical" as const,
                  })),
                ...banks
                  .filter(
                    (b) =>
                      b.lebaneseExposure &&
                      (b.auditOpinion === "Qualified" ||
                        b.auditOpinion === "Emphasis of Matter")
                  )
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Lebanese Exposure Non-Compliance",
                    description: `Audit raised provisioning concerns`,
                    severity: "Critical" as const,
                  })),
              ];

              return criticalIssues.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                    CRITICAL
                  </div>
                  {criticalIssues.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded text-xs"
                    >
                      <div className="status-dot red flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-red-900 dark:text-red-200">
                          {item.bank}
                        </div>
                        <div className="text-red-700 dark:text-red-300">
                          {item.issue}
                        </div>
                        <div className="text-red-600 dark:text-red-400 text-[10px] mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* HIGH SEVERITY ISSUES */}
            {(() => {
              const highIssues = [
                ...banks
                  .filter((b) => b.riskRating === "High")
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "High Risk Rating",
                    description: `Elevated supervisory monitoring required`,
                    severity: "High" as const,
                  })),
                ...banks
                  .filter(
                    (b) =>
                      b.equityToAssets <
                      10
                  )
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Low Capitalization",
                    description: `E/A: ${b.equityToAssets.toFixed(1)}% (below 10% threshold)`,
                    severity: "High" as const,
                  })),
                ...banks
                  .filter((b) => b.netProfit < 0)
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Loss-Making Bank",
                    description: `Net loss: ${formatSYP(Math.abs(b.netProfit))}`,
                    severity: "High" as const,
                  })),
                ...banks
                  .filter(
                    (b) =>
                      b.nplRatio !== null && b.nplRatio > 10
                  )
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Elevated NPL Ratio",
                    description: `NPL: ${b.nplRatio!.toFixed(1)}% (above 10% threshold)`,
                    severity: "High" as const,
                  })),
              ];

              return highIssues.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    High
                  </div>
                  {highIssues.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded text-xs"
                    >
                      <div className="status-dot amber flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-amber-900 dark:text-amber-200">
                          {item.bank}
                        </div>
                        <div className="text-amber-700 dark:text-amber-300">
                          {item.issue}
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 text-[10px] mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* MEDIUM SEVERITY ISSUES */}
            {(() => {
              const mediumIssues = [
                ...banks
                  .filter((b) => b.riskRating === "Medium")
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Medium Risk Rating",
                    description: `Regular supervisory review`,
                    severity: "Medium" as const,
                  })),
                ...banks
                  .filter((b) => b.reportingPeriod === "YE 2023")
                  .map((b) => ({
                    bank: b.shortName,
                    issue: "Stale Reporting",
                    description: `${b.reportingPeriod} data (behind sector)`,
                    severity: "Medium" as const,
                  })),
              ];

              return mediumIssues.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Medium
                  </div>
                  {mediumIssues.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded text-xs"
                    >
                      <div className="status-dot green flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-blue-900 dark:text-blue-200">
                          {item.bank}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          {item.issue}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 text-[10px] mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* RIGHT: Sector Snapshot (40%) */}
        <div className="card-surface p-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Risk Distribution
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Low",
                  count: banks.filter((b) => b.riskRating === "Low").length,
                  color: "emerald",
                },
                {
                  label: "Medium",
                  count: banks.filter((b) => b.riskRating === "Medium").length,
                  color: "amber",
                },
                {
                  label: "High",
                  count: banks.filter((b) => b.riskRating === "High").length,
                  color: "red",
                },
              ].map((item) => {
                const total = banks.length;
                const pct = (item.count / total) * 100;
                const colorMap: Record<
                  string,
                  { bar: string; text: string }
                > = {
                  emerald: {
                    bar: "bg-emerald-500",
                    text: "text-emerald-700 dark:text-emerald-300",
                  },
                  amber: {
                    bar: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-300",
                  },
                  red: { bar: "bg-red-500", text: "text-red-700 dark:text-red-300" },
                };
                const colors = colorMap[item.color];
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className={`font-bold ${colors.text}`}>
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Audit Opinions
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Clean",
                  count: sectorAggregates.cleanOpinions,
                  color: "emerald",
                },
                {
                  label: "Qualified",
                  count: sectorAggregates.qualifiedOpinions,
                  color: "red",
                },
                {
                  label: "EOM",
                  count: sectorAggregates.emphasisOfMatter,
                  color: "amber",
                },
              ].map((item) => {
                const total = sectorAggregates.totalBanks;
                const pct = (item.count / total) * 100;
                const colorMap: Record<
                  string,
                  { bar: string; text: string }
                > = {
                  emerald: {
                    bar: "bg-emerald-500",
                    text: "text-emerald-700 dark:text-emerald-300",
                  },
                  amber: {
                    bar: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-300",
                  },
                  red: { bar: "bg-red-500", text: "text-red-700 dark:text-red-300" },
                };
                const colors = colorMap[item.color];
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className={`font-bold ${colors.text}`}>
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Market Concentration
            </h3>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {calculateHHI(banks).toFixed(0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {calculateHHI(banks) > 2500
                  ? "Highly concentrated"
                  : calculateHHI(banks) > 1500
                  ? "Moderately concentrated"
                  : "Competitive"}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
                Top 5 banks: {sectorAggregates.top5Concentration}% of assets
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Top 3 Banks
            </h3>
            <div className="space-y-2 text-xs">
              {banks
                .sort((a, b) => b.totalAssets - a.totalAssets)
                .slice(0, 3)
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {b.shortName}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                      {formatSYP(b.totalAssets)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          COMPLIANCE MATRIX - All 18 banks with prudential metrics
          ==================================================================== */}
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          <Zap className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Prudential Compliance Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50/80 dark:bg-slate-800/50 w-32">
                  Bank
                </th>
                <th className="w-12">Type</th>
                {prudentialBenchmarks.map((bench) => (
                  <th
                    key={bench.metric}
                    className="w-10 text-center"
                    title={bench.description}
                  >
                    <div className="text-[9px]">{bench.metric.substring(0, 10)}</div>
                  </th>
                ))}
                <th className="w-10 text-center" title="Non-Performing Loans Ratio">
                  <div className="text-[9px]">NPL%</div>
                </th>
                <th className="w-12">Audit</th>
                <th className="w-12">Risk</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank) => {
                const bankMetrics = {
                  "Capital Adequacy (Equity/Assets)": bank.equityToAssets,
                  "Return on Assets (ROA)": bank.roa,
                  "Return on Equity (ROE)": bank.roe,
                  "Cost-to-Income Ratio": bank.costToIncome,
                  "Loans-to-Deposits Ratio": bank.loansToDeposits,
                  "Cash-to-Assets Ratio": bank.cashToAssets,
                };

                const riskColor =
                  bank.riskRating === "Low"
                    ? "text-emerald-600"
                    : bank.riskRating === "Medium"
                    ? "text-amber-600"
                    : bank.riskRating === "High"
                    ? "text-red-600"
                    : "text-red-800";

                const auditColor =
                  bank.auditOpinion === "Clean"
                    ? "text-emerald-600"
                    : bank.auditOpinion === "Qualified"
                    ? "text-red-600"
                    : "text-amber-600";

                return (
                  <tr key={bank.id}>
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 font-medium">
                      {bank.shortName}
                    </td>
                    <td className="text-center">
                      <div className="text-[10px] font-bold tracking-wider">
                        {bank.type === "Conventional"
                          ? "C"
                          : bank.type === "Islamic"
                          ? "I"
                          : "MF"}
                      </div>
                    </td>
                    {prudentialBenchmarks.map((bench) => {
                      const value =
                        bankMetrics[
                          bench.metric as keyof typeof bankMetrics
                        ];
                      const status = getMetricStatus(
                        value,
                        bench.thresholdGood,
                        bench.thresholdCaution,
                        bench.thresholdDanger,
                        bench.higher_is_better
                      );

                      const dotColor =
                        status === "good"
                          ? "green"
                          : status === "caution"
                          ? "amber"
                          : "red";

                      return (
                        <td
                          key={bench.metric}
                          className="text-center"
                          title={`${value.toFixed(1)}`}
                        >
                          <div className={`status-dot ${dotColor} mx-auto`} />
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <div className={`text-[10px] font-bold ${auditColor}`}>
                        {bank.auditOpinion === "Clean"
                          ? "C"
                          : bank.auditOpinion === "Qualified"
                          ? "Q"
                          : "E"}
                      </div>
                    </td>
                    <td className="text-center" title={bank.nplRatio !== null ? `${bank.nplRatio.toFixed(1)}%` : "N/A"}>
                      {bank.nplRatio !== null ? (
                        <div className={`status-dot ${bank.nplRatio > 10 ? "red" : bank.nplRatio > 5 ? "amber" : "green"} mx-auto`} />
                      ) : (
                        <span className="text-[9px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className={`text-[10px] font-bold ${riskColor}`}>
                        {bank.riskRating.substring(0, 1)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div>
            <strong>Audit:</strong> C = Clean | Q = Qualified | E = Emphasis of
            Matter
          </div>
          <div>
            <strong>Risk:</strong> L = Low | M = Medium | H = High | C = Critical
          </div>
          <div>
            <strong>Metrics:</strong>{" "}
            <span className="inline-flex items-center gap-1">
              <span className="status-dot green inline-block" /> = Good |
              <span className="status-dot amber inline-block" /> = Caution |
              <span className="status-dot red inline-block" /> = Danger
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          RISK HEATMAP - Asset-weighted prudential metrics distribution
          ==================================================================== */}
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Sector Metric Health Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prudentialBenchmarks.map((bench) => {
            const bankValues = banks.map((b) => {
              const metric = bench.metric as keyof typeof bankMetrics;
              const bankMetrics = {
                "Capital Adequacy (Equity/Assets)": b.equityToAssets,
                "Return on Assets (ROA)": b.roa,
                "Return on Equity (ROE)": b.roe,
                "Cost-to-Income Ratio": b.costToIncome,
                "Loans-to-Deposits Ratio": b.loansToDeposits,
                "Cash-to-Assets Ratio": b.cashToAssets,
              };
              return bankMetrics[metric];
            });

            const avgValue =
              bankValues.reduce((a, b) => a + b, 0) / bankValues.length;
            const status = getMetricStatus(
              avgValue,
              bench.thresholdGood,
              bench.thresholdCaution,
              bench.thresholdDanger,
              bench.higher_is_better
            );

            const statusColor =
              status === "good"
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                : status === "caution"
                ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                : "text-red-600 bg-red-50 dark:bg-red-950/30";

            const goodCount = bankValues.filter(
              (v) =>
                getMetricStatus(
                  v,
                  bench.thresholdGood,
                  bench.thresholdCaution,
                  bench.thresholdDanger,
                  bench.higher_is_better
                ) === "good"
            ).length;

            const cautionCount = bankValues.filter(
              (v) =>
                getMetricStatus(
                  v,
                  bench.thresholdGood,
                  bench.thresholdCaution,
                  bench.thresholdDanger,
                  bench.higher_is_better
                ) === "caution"
            ).length;

            return (
              <div
                key={bench.metric}
                className={`p-4 rounded-lg border ${statusColor}`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  {bench.metric}
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  {bench.metric === "Cost-to-Income Ratio" ||
                  bench.metric === "Loans-to-Deposits Ratio"
                    ? `${avgValue.toFixed(1)}%`
                    : bench.metric === "Return on Assets (ROA)" ||
                    bench.metric === "Return on Equity (ROE)" ||
                    bench.metric === "Capital Adequacy (Equity/Assets)" ||
                    bench.metric === "Cash-to-Assets Ratio"
                    ? `${avgValue.toFixed(1)}%`
                    : avgValue.toFixed(1)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="font-semibold text-emerald-600">
                      {goodCount}
                    </span>{" "}
                    Good
                  </div>
                  <div>
                    <span className="font-semibold text-amber-600">
                      {cautionCount}
                    </span>{" "}
                    Caution
                  </div>
                  <div>
                    <span className="font-semibold text-red-600">
                      {banks.length - goodCount - cautionCount}
                    </span>{" "}
                    Danger
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          BANK TYPE & SECTOR DISTRIBUTION
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Type Composition */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            Bank Type Distribution
          </h3>
          <div className="space-y-3">
            {[
              {
                type: "Conventional",
                count: sectorAggregates.conventional,
                color: "#3b82f6",
              },
              {
                type: "Islamic",
                count: sectorAggregates.islamic,
                color: "#10b981",
              },
              {
                type: "Microfinance",
                count: sectorAggregates.microfinance,
                color: "#f59e0b",
              },
            ].map((item) => {
              const pct = (item.count / sectorAggregates.totalBanks) * 100;
              return (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-200">
                      {item.type}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {item.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lebanese Exposure Summary */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            Lebanese Exposure Risk
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl font-bold text-red-600">
                {sectorAggregates.lebaneseExposed}
              </div>
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Banks with Lebanese exposure
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {(
                    (sectorAggregates.lebaneseExposed /
                      sectorAggregates.totalBanks) *
                    100
                  ).toFixed(0)}
                  % of sector
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Compliance Status:
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="status-dot red" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {
                      banks.filter(
                        (b) =>
                          b.lebaneseExposure &&
                          b.auditOpinion === "Qualified"
                      ).length
                    }{" "}
                    flagged in audits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="status-dot amber" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {
                      banks.filter(
                        (b) =>
                          b.lebaneseExposure &&
                          b.auditOpinion === "Emphasis of Matter"
                      ).length
                    }{" "}
                    under emphasis of matter
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
