import { format } from "date-fns";
import { banks, sectorAggregates, prudentialBenchmarks } from "../data/banks";
import { lebaneseExposureData, dataGaps } from "../data/lebanese-exposure";
import { cn, formatSYP, getMetricStatus, getStatusBg } from "../lib/utils";
import { AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";

interface CAMELSRating {
  bankId: number;
  bankName: string;
  shortName: string;
  type: string;
  totalAssets: number;
  capital: number;
  assetQuality: number;
  management: number;
  earnings: number;
  liquidity: number;
  sensitivity: number;
  overallRating: number;
}

function calculateCAMELSRatings(): CAMELSRating[] {
  return banks.map((bank) => {
    // Capital: equity/assets vs benchmark[0]
    const capBench = prudentialBenchmarks[0];
    const capStatus = getMetricStatus(
      bank.equityToAssets,
      capBench.thresholdGood,
      capBench.thresholdCaution,
      capBench.thresholdDanger,
      capBench.higher_is_better
    );
    const capital =
      capStatus === "good" ? 5 : capStatus === "caution" ? 3 : 1;

    // Asset Quality: audit opinion + risk rating
    let assetQuality = 5;
    if (bank.auditOpinion === "Qualified" || bank.riskRating === "High") {
      assetQuality = 2;
    } else if (
      bank.auditOpinion === "Emphasis of Matter" ||
      bank.riskRating === "Medium"
    ) {
      assetQuality = 3;
    }

    // Management: cost-to-income vs benchmark[3]
    const mgmtBench = prudentialBenchmarks[3];
    const mgmtStatus = getMetricStatus(
      bank.costToIncome,
      mgmtBench.thresholdGood,
      mgmtBench.thresholdCaution,
      mgmtBench.thresholdDanger,
      mgmtBench.higher_is_better
    );
    const management =
      mgmtStatus === "good" ? 5 : mgmtStatus === "caution" ? 3 : 1;

    // Earnings: ROA vs benchmark[1]
    const earBench = prudentialBenchmarks[1];
    const earStatus = getMetricStatus(
      bank.roa,
      earBench.thresholdGood,
      earBench.thresholdCaution,
      earBench.thresholdDanger,
      earBench.higher_is_better
    );
    const earnings =
      earStatus === "good" ? 5 : earStatus === "caution" ? 3 : 1;

    // Liquidity: cash/assets vs benchmark[5]
    const liqBench = prudentialBenchmarks[5];
    const liqStatus = getMetricStatus(
      bank.cashToAssets,
      liqBench.thresholdGood,
      liqBench.thresholdCaution,
      liqBench.thresholdDanger,
      liqBench.higher_is_better
    );
    const liquidity =
      liqStatus === "good" ? 5 : liqStatus === "caution" ? 3 : 1;

    // Sensitivity: Lebanese exposure + loan concentration
    let sensitivity = 5;
    if (bank.lebaneseExposure) {
      sensitivity = 1;
    } else if (bank.loansToDeposits > 100) {
      sensitivity = 3;
    }

    const ratings = [capital, assetQuality, management, earnings, liquidity, sensitivity];
    const overallRating = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);

    return {
      bankId: bank.id,
      bankName: bank.name,
      shortName: bank.shortName,
      type: bank.type,
      totalAssets: bank.totalAssets,
      capital,
      assetQuality,
      management,
      earnings,
      liquidity,
      sensitivity,
      overallRating,
    };
  });
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (rating >= 3) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function getRatingBgCell(rating: number): string {
  if (rating >= 4) return "bg-emerald-100/40";
  if (rating >= 3) return "bg-amber-100/40";
  return "bg-red-100/40";
}

export function ExecutiveSummaryPage() {
  const camelsRatings = calculateCAMELSRatings();
  const ratedBanks = [...camelsRatings].sort(
    (a, b) => a.overallRating - b.overallRating
  );


  const keyRiskIndicators = [
    {
      metric: "Capital Adequacy",
      value: sectorAggregates.wtdAvgEquityToAssets,
      unit: "%",
      benchmark: 15,
      status: getMetricStatus(
        sectorAggregates.wtdAvgEquityToAssets,
        15,
        10,
        8,
        true
      ),
    },
    {
      metric: "Return on Assets",
      value: sectorAggregates.wtdAvgROA,
      unit: "%",
      benchmark: 1.5,
      status: getMetricStatus(sectorAggregates.wtdAvgROA, 1.5, 0.5, 0, true),
    },
    {
      metric: "Loan-to-Deposit Ratio",
      value: (
        (sectorAggregates.totalCredit / sectorAggregates.totalDeposits) *
        100
      ).toFixed(1),
      unit: "%",
      benchmark: 70,
      status: getMetricStatus(
        (sectorAggregates.totalCredit / sectorAggregates.totalDeposits) * 100,
        70,
        100,
        120,
        false
      ),
    },
    {
      metric: "Liquid Assets",
      value: (
        (sectorAggregates.totalCash / sectorAggregates.totalAssets) *
        100
      ).toFixed(1),
      unit: "%",
      benchmark: 20,
      status: getMetricStatus(
        (sectorAggregates.totalCash / sectorAggregates.totalAssets) * 100,
        20,
        10,
        5,
        true
      ),
    },
    {
      metric: "Clean Audit Opinions",
      value: (
        (sectorAggregates.cleanOpinions / sectorAggregates.totalBanks) *
        100
      ).toFixed(0),
      unit: "%",
      benchmark: 80,
      status: getMetricStatus(
        (sectorAggregates.cleanOpinions / sectorAggregates.totalBanks) * 100,
        80,
        60,
        40,
        true
      ),
    },
    {
      metric: "Cost-to-Income Avg",
      value: 48.5,
      unit: "%",
      benchmark: 50,
      status: getMetricStatus(48.5, 50, 70, 80, false),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="card-surface border-t-4 border-blue-600 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Supervisory Assessment
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Banking Sector Stability Review
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {format(new Date(), "dd MMM yyyy")}
            </p>
            <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded">
              INTERNAL USE
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Sector Health Overview */}
      <div className="card-surface p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          Sector Health Overview
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          The Syrian banking sector comprises 18 institutions with combined assets of SYP 49.3 trillion, maintaining weighted average capital adequacy of 24.9% equity-to-assets against the regulatory minimum of 8%. Profitability remains constrained with sector ROA of 4.5% reflecting operational challenges, while 10 banks (55.6%) maintain clean audit opinions. Critical supervisory concern: 5 banks (27.8%) hold significant Lebanese exposures following the 2019 financial crisis, with provisioning gaps identified in two institutions requiring immediate remedial action. Data integrity constraints limit full prudential assessment without regulatory reporting access.
        </p>
      </div>

      {/* Section 2: Key Risk Indicators */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Key Risk Indicators
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Metric
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Current Value
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Benchmark
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {keyRiskIndicators.map((kri, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                    {kri.metric}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {kri.value}
                    <span className="text-xs ml-1">{kri.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {kri.benchmark}
                    <span className="text-xs ml-1">{kri.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "inline-block w-3 h-3 rounded-full",
                        getStatusBg(kri.status)
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: CAMELS Ratings */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          CAMELS Supervisory Rating by Institution
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Bank
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Type
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Assets
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  C
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  A
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  M
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  E
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  L
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  S
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Overall
                </th>
              </tr>
            </thead>
            <tbody>
              {ratedBanks.map((bank) => (
                <tr
                  key={bank.bankId}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {bank.shortName}
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[10px]">
                    {bank.type}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300 text-[10px]">
                    {(bank.totalAssets / 1e9).toFixed(1)}B
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.capital)
                    )}
                  >
                    {bank.capital}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.assetQuality)
                    )}
                  >
                    {bank.assetQuality}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.management)
                    )}
                  >
                    {bank.management}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.earnings)
                    )}
                  >
                    {bank.earnings}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.liquidity)
                    )}
                  >
                    {bank.liquidity}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-semibold",
                      getRatingBgCell(bank.sensitivity)
                    )}
                  >
                    {bank.sensitivity}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-center font-bold border-l-2",
                      getRatingColor(bank.overallRating)
                    )}
                  >
                    {bank.overallRating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[10px] text-slate-600 dark:text-slate-400">
          Scale: 5=Strong, 4=Satisfactory, 3=Fair, 2=Marginal, 1=Weak
        </div>
      </div>

      {/* Section 4: Priority Supervisory Actions */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Priority Supervisory Actions
        </h3>
        <div className="space-y-3">
          <div className="flex gap-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shrink-0">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Lebanese Exposure Remediation
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Shahba Bank requires immediate supplementary provisioning (11.42% gap to 30% CBS requirement). BSFF, BSO, ATB, Fransa require enhanced ECL adequacy justification with independent validation.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shrink-0">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Qualified Audit Resolution
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Six banks with qualified opinions (BSFF, BSO, ATB, Fransa, Shahba, Al Wataniya) require auditor certification of remediation by Q2 2026. Emphasis of Matter banks (IIB, Al Khalij) require ECL model updates.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 rounded">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Data Completeness Enhancement
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Implement regulatory reporting system (COREP/FINREP equivalent) to capture Basel III prudential metrics: CAR, NPL ratios, LCR, NSFR, leverage ratios. Quarterly submissions by end-Q3 2026.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 rounded">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              4
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Profitability & Efficiency Oversight
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Monitor Al Wataniya, Fransa, Shahba for deteriorating ROA (below 1%). Cost-to-income thresholds require quarterly review with targeted remediation plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Lebanese Exposure Summary */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          Lebanese Exposure Summary
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
          Systemic risk concentration: 5 banks with Lebanese parent/correspondent relationships aggregate SYP {formatSYP(
            banks
              .filter((b) => b.lebaneseExposure)
              .reduce((sum, b) => sum + b.totalAssets, 0)
          )} in total assets (27.8% of sector). CBS Decision 2024 mandates minimum 30% specific provisioning. Shahba Bank critically non-compliant (18.58% vs 30% requirement). Four banks (BSFF, BSO, ATB, Fransa) present provision adequacy concerns requiring ECL model validation and independent credit assessment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lebaneseExposureData.map((exp) => {
            const status =
              exp.complianceStatus === "Non-Compliant"
                ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-900/50"
                : "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/50";
            return (
              <div key={exp.bankShortName} className={cn("p-3 rounded border", status)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {exp.bankShortName}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      exp.complianceStatus === "Non-Compliant"
                        ? "bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                        : "bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {exp.complianceStatus}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                  {exp.parentAffiliation}
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  {exp.provisioningStatus}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6: Data Quality Assessment */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-amber-600" />
          Data Quality & Assessment Gaps
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
          Current supervisory assessment relies on published financial statements (IFRS-based annual reports). Six critical prudential metrics required under Basel III Pillar 3 disclosure requirements remain unavailable. Full prudential adequacy assessment constrained without access to regulatory reporting data (risk-weighted assets, liquidity coverage ratios, leverage ratios, detailed asset quality breakdowns).
        </p>
        <div className="space-y-2">
          {dataGaps.map((gap, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 rounded text-xs border border-slate-200 dark:border-slate-700"
            >
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-bold shrink-0 text-[9px]",
                  gap.status === "Missing"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : gap.status === "Partial"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                )}
              >
                {gap.status}
              </span>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {gap.metric}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {gap.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
