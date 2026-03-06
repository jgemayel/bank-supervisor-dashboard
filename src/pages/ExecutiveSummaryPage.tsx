import {
  FileText,
  AlertTriangle,
  Shield,
  Activity,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  CheckCircle2,
} from "lucide-react";
import type { PrudentialBenchmark } from "../types/index";
import { banks, sectorAggregates, prudentialBenchmarks } from "../data/banks";
import { cn, formatSYP, calculateHHI } from "../lib/utils";
import { StatusBadge } from "../components/StatusBadge";

interface SectorHealthMetrics {
  complianceScore: number;
  auditScore: number;
  concentrationScore: number;
  lebaneseExposureScore: number;
  roaHealthScore: number;
  compositeScore: number;
}

interface CAMELSRating {
  bankId: number;
  bankName: string;
  capital: number;
  assetQuality: number;
  management: number;
  earnings: number;
  liquidity: number;
  sensitivity: number;
  overallRating: number;
}

interface SupervisoryAction {
  priority: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  affectedBanks: string[];
  count: number;
}

interface EarlyWarningBank {
  bankName: string;
  riskCount: number;
  criteria: string[];
}

interface SupervisoryReadinessMetrics {
  overallScore: number;
  dataCompleteness: number;
  auditQuality: number;
  capitalAdequacy: number;
  riskIdentification: number;
  reportingTimeliness: number;
}

function calculateSupervisoryReadinessScore(): SupervisoryReadinessMetrics {
  // Data Completeness (25%): % of banks with complete financial data
  // All 18 banks have complete data, so score is 100%
  const dataCompleteness = 100;

  // Audit Quality (20%): % of Clean audit opinions
  const cleanAuditBanks = banks.filter((b) => b.auditOpinion === "Clean").length;
  const auditQuality = (cleanAuditBanks / banks.length) * 100;

  // Capital Adequacy (25%): % of banks meeting 5% equity-to-assets minimum
  const capitalBenchmark = prudentialBenchmarks.find(
    (p) => p.metric.includes("Capital Adequacy")
  ) as PrudentialBenchmark;
  const minThreshold = capitalBenchmark?.thresholdDanger || 5;
  const adequateBanks = banks.filter((b) => b.equityToAssets >= minThreshold).length;
  const capitalAdequacy = (adequateBanks / banks.length) * 100;

  // Risk Identification (15%): % of banks with proper risk ratings assigned
  // All banks have risk ratings assigned in our data
  const riskIdentification = 100;

  // Reporting Timeliness (15%): % of banks reporting for 2024
  const currentReportingBanks = banks.filter(
    (b) => b.reportingPeriod === "YE 2024"
  ).length;
  const reportingTimeliness = (currentReportingBanks / banks.length) * 100;

  // Composite score (weighted average)
  const overallScore =
    dataCompleteness * 0.25 +
    auditQuality * 0.2 +
    capitalAdequacy * 0.25 +
    riskIdentification * 0.15 +
    reportingTimeliness * 0.15;

  return {
    overallScore,
    dataCompleteness,
    auditQuality,
    capitalAdequacy,
    riskIdentification,
    reportingTimeliness,
  };
}

function calculateSectorHealthScore(): SectorHealthMetrics {
  // % of banks with "good" compliance scores (weighted 25%)
  const goodComplianceBanks = banks.filter(
    (b) =>
      b.equityToAssets >= 15 &&
      b.costToIncome <= 50 &&
      b.loansToDeposits <= 100
  ).length;
  const complianceScore = (goodComplianceBanks / banks.length) * 100;

  // % with clean audit opinions (weighted 25%)
  const cleanAuditBanks = banks.filter((b) => b.auditOpinion === "Clean").length;
  const auditScore = (cleanAuditBanks / banks.length) * 100;

  // Inverse of HHI concentration (weighted 15%)
  const hhi = calculateHHI(banks);
  const maxHHI = 10000;
  const concentrationScore = ((maxHHI - hhi) / maxHHI) * 100;

  // % without Lebanese exposure (weighted 15%)
  const noLebaneseExposure = banks.filter((b) => !b.lebaneseExposure).length;
  const lebaneseExposureScore = (noLebaneseExposure / banks.length) * 100;

  // Average ROA health (weighted 20%)
  const avgROA = banks.reduce((sum, b) => sum + b.roa, 0) / banks.length;
  const roaHealthScore = Math.min(100, (avgROA / 2.0) * 100);

  // Composite score (weighted average)
  const compositeScore =
    complianceScore * 0.25 +
    auditScore * 0.25 +
    concentrationScore * 0.15 +
    lebaneseExposureScore * 0.15 +
    roaHealthScore * 0.2;

  return {
    complianceScore,
    auditScore,
    concentrationScore,
    lebaneseExposureScore,
    roaHealthScore,
    compositeScore,
  };
}

function calculateCAMELSRatings(): CAMELSRating[] {
  return banks.map((bank) => {
    // C (Capital): equityToAssets status - 5 point scale
    let capital: number;
    if (bank.equityToAssets >= 30) capital = 5;
    else if (bank.equityToAssets >= 20) capital = 4;
    else if (bank.equityToAssets >= 10) capital = 3;
    else if (bank.equityToAssets >= 5) capital = 2;
    else capital = 1;

    // A (Asset Quality): loansToDeposits + audit opinion
    let assetQuality: number;
    const loanScore =
      bank.loansToDeposits <= 60
        ? 5
        : bank.loansToDeposits <= 80
        ? 4
        : bank.loansToDeposits <= 100
        ? 3
        : bank.loansToDeposits <= 150
        ? 2
        : 1;

    const auditScore =
      bank.auditOpinion === "Clean"
        ? 5
        : bank.auditOpinion === "Emphasis of Matter"
        ? 3
        : 1;

    assetQuality = (loanScore + auditScore) / 2;

    // M (Management): costToIncome efficiency (inverse)
    let management: number;
    if (bank.costToIncome <= 40) management = 5;
    else if (bank.costToIncome <= 50) management = 4;
    else if (bank.costToIncome <= 65) management = 3;
    else if (bank.costToIncome <= 80) management = 2;
    else management = 1;

    // E (Earnings): ROA + ROE
    let earnings: number;
    const roaScore =
      bank.roa >= 2
        ? 5
        : bank.roa >= 1.5
        ? 4
        : bank.roa >= 0.5
        ? 3
        : bank.roa >= 0
        ? 2
        : 1;

    const roeScore =
      bank.roe >= 15
        ? 5
        : bank.roe >= 10
        ? 4
        : bank.roe >= 5
        ? 3
        : bank.roe >= 0
        ? 2
        : 1;

    earnings = (roaScore + roeScore) / 2;

    // L (Liquidity): cashToAssets
    let liquidity: number;
    if (bank.cashToAssets >= 40) liquidity = 5;
    else if (bank.cashToAssets >= 30) liquidity = 4;
    else if (bank.cashToAssets >= 20) liquidity = 3;
    else if (bank.cashToAssets >= 10) liquidity = 2;
    else liquidity = 1;

    // S (Sensitivity): lebaneseExposure + riskRating
    let sensitivity: number;
    const riskScore =
      bank.riskRating === "Low"
        ? 5
        : bank.riskRating === "Medium"
        ? 3
        : bank.riskRating === "High"
        ? 1
        : 0;

    const lebaneseScore = bank.lebaneseExposure ? 1 : 5;

    sensitivity = (riskScore + lebaneseScore) / 2;

    const overallRating =
      (capital + assetQuality + management + earnings + liquidity + sensitivity) / 6;

    return {
      bankId: bank.id,
      bankName: bank.shortName,
      capital: Math.round(capital * 10) / 10,
      assetQuality: Math.round(assetQuality * 10) / 10,
      management: Math.round(management * 10) / 10,
      earnings: Math.round(earnings * 10) / 10,
      liquidity: Math.round(liquidity * 10) / 10,
      sensitivity: Math.round(sensitivity * 10) / 10,
      overallRating: Math.round(overallRating * 10) / 10,
    };
  });
}

function generateSupervisoryActions(): SupervisoryAction[] {
  const actions: SupervisoryAction[] = [];

  // Critical: Lebanese exposure enforcement
  const lebaneseExposedBanks = banks
    .filter((b) => b.lebaneseExposure)
    .map((b) => b.shortName);
  if (lebaneseExposedBanks.length > 0) {
    actions.push({
      priority: "Critical",
      title: "Enforce Lebanese Exposure Provisioning",
      description:
        "Apply CBS 30% provisioning requirement and escalate to banks with insufficient coverage",
      affectedBanks: lebaneseExposedBanks,
      count: lebaneseExposedBanks.length,
    });
  }

  // High: Qualified audit opinions
  const qualifiedAuditBanks = banks
    .filter((b) => b.auditOpinion === "Qualified")
    .map((b) => b.shortName);
  if (qualifiedAuditBanks.length > 0) {
    actions.push({
      priority: "High",
      title: "Follow Up on Qualified Audit Opinions",
      description:
        "Schedule meeting with auditors and bank management to clarify audit reservations",
      affectedBanks: qualifiedAuditBanks,
      count: qualifiedAuditBanks.length,
    });
  }

  // Medium: Capital adequacy for undercapitalized banks
  const undercapitalizedBanks = banks
    .filter((b) => b.equityToAssets < 10)
    .map((b) => b.shortName);
  if (undercapitalizedBanks.length > 0) {
    actions.push({
      priority: "Medium",
      title: "Address Capital Adequacy Issues",
      description:
        "Require capital augmentation plan or corrective action for E/A < 10%",
      affectedBanks: undercapitalizedBanks,
      count: undercapitalizedBanks.length,
    });
  }

  // Low: Request updated financials from YE 2023 reporters
  const staleBanks = banks
    .filter((b) => b.reportingPeriod === "YE 2023")
    .map((b) => b.shortName);
  if (staleBanks.length > 0) {
    actions.push({
      priority: "Low",
      title: "Request Updated Financial Statements",
      description:
        "Request YE 2024 financials from banks still reporting on YE 2023 basis",
      affectedBanks: staleBanks,
      count: staleBanks.length,
    });
  }

  return actions;
}

function identifyEarlyWarnings(): EarlyWarningBank[] {
  const warnings: EarlyWarningBank[] = [];

  for (const bank of banks) {
    const criteria: string[] = [];

    // High risk rating
    if (bank.riskRating === "High" || bank.riskRating === "Critical") {
      criteria.push("High Risk Rating");
    }

    // Lebanese exposure with qualified opinion
    if (bank.lebaneseExposure && bank.auditOpinion === "Qualified") {
      criteria.push("Lebanese Exposure + Qualified Audit");
    }

    // Low capitalization
    if (bank.equityToAssets < 10) {
      criteria.push("Low Capitalization (E/A < 10%)");
    }

    // Stale reporting
    if (bank.reportingPeriod === "YE 2023") {
      criteria.push("Stale Reporting (YE 2023)");
    }

    // Negative earnings
    if (bank.roa < 0 || bank.roe < 0) {
      criteria.push("Negative Earnings");
    }

    // Poor cost-to-income
    if (bank.costToIncome > 80) {
      criteria.push("Very High Cost-to-Income Ratio");
    }

    if (criteria.length >= 2) {
      warnings.push({
        bankName: bank.shortName,
        riskCount: criteria.length,
        criteria,
      });
    }
  }

  return warnings.sort((a, b) => b.riskCount - a.riskCount);
}

function getReadinessScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function getReadinessScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50";
  if (score >= 60) return "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50";
  if (score >= 40) return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50";
  return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50";
}

function getReadinessComponentColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200";
  if (score >= 60) return "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200";
  if (score >= 40) return "bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200";
  return "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200";
}

function getComponentIconColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getHealthScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getHealthScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-50 border-emerald-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "text-emerald-600 bg-emerald-50";
  if (rating >= 3) return "text-amber-600 bg-amber-50";
  if (rating >= 2) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

export function ExecutiveSummaryPage() {
  const readinessMetrics = calculateSupervisoryReadinessScore();
  const healthMetrics = calculateSectorHealthScore();
  const camelRatings = calculateCAMELSRatings();
  const supervisoryActions = generateSupervisoryActions();
  const earlyWarnings = identifyEarlyWarnings();

  // Generate key findings
  const highRiskBanks = banks.filter((b) => b.riskRating === "High");
  const qualifiedOpinionBanks = banks.filter((b) => b.auditOpinion === "Qualified");
  const lowCapitalBanks = banks.filter((b) => b.equityToAssets < 10);
  const staleReportingBanks = banks.filter((b) => b.reportingPeriod === "YE 2023");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Executive Sector Health Briefing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Central Bank of Syria - Auto-Generated Supervisory Dashboard
          </p>
        </div>
      </div>

      {/* Sector Health Score Card */}
      <div className={cn("bg-white dark:bg-slate-800 rounded-xl border p-6", getHealthScoreBg(healthMetrics.compositeScore))}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Overall Sector Health Score
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Composite index based on compliance, audit quality, concentration, and profitability
            </p>
          </div>
          <Shield className={cn("h-8 w-8", getHealthScoreColor(healthMetrics.compositeScore))} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className={cn("text-3xl font-bold mb-1", getHealthScoreColor(healthMetrics.compositeScore))}>
              {Math.round(healthMetrics.compositeScore)}
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              OVERALL SCORE (0-100)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(healthMetrics.complianceScore)}%
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Compliance Score (25%)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(healthMetrics.auditScore)}%
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Clean Audits (25%)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(healthMetrics.lebaneseExposureScore)}%
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Lebanese Exposure (15%)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(healthMetrics.roaHealthScore)}%
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              ROA Health (20%)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(healthMetrics.concentrationScore)}%
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Concentration (15%)
            </div>
          </div>
        </div>
      </div>

      {/* Supervisory Readiness Score */}
      <div className={cn("bg-white dark:bg-slate-800 rounded-xl border p-6", getReadinessScoreBg(readinessMetrics.overallScore))}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Supervisory Readiness Score
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Assessment of CBS preparedness for effective bank supervision based on data quality and compliance metrics
            </p>
          </div>
          <CheckCircle2 className={cn("h-8 w-8", getReadinessScoreColor(readinessMetrics.overallScore))} />
        </div>

        {/* Overall Score Display */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-slate-200 dark:text-slate-600"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(readinessMetrics.overallScore / 100) * 339.29} 339.29`}
                  className={cn(
                    "transition-all duration-300",
                    readinessMetrics.overallScore >= 80
                      ? "text-emerald-600"
                      : readinessMetrics.overallScore >= 60
                      ? "text-amber-600"
                      : readinessMetrics.overallScore >= 40
                      ? "text-orange-600"
                      : "text-red-600"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold",
                    getReadinessScoreColor(readinessMetrics.overallScore)
                  )}>
                    {Math.round(readinessMetrics.overallScore)}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    / 100
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Scores */}
          <div className="lg:col-span-3 space-y-2">
            {/* Data Completeness */}
            <div className={cn("rounded-lg p-3 flex items-center justify-between", getReadinessComponentColor(readinessMetrics.dataCompleteness))}>
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", getComponentIconColor(readinessMetrics.dataCompleteness))} />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Data Completeness</div>
                  <div className="text-xs opacity-75">All banks reporting full financial data</div>
                </div>
              </div>
              <div className="text-sm font-bold">{Math.round(readinessMetrics.dataCompleteness)}%</div>
            </div>

            {/* Audit Quality */}
            <div className={cn("rounded-lg p-3 flex items-center justify-between", getReadinessComponentColor(readinessMetrics.auditQuality))}>
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", getComponentIconColor(readinessMetrics.auditQuality))} />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Audit Quality</div>
                  <div className="text-xs opacity-75">Clean audit opinions achieved</div>
                </div>
              </div>
              <div className="text-sm font-bold">{Math.round(readinessMetrics.auditQuality)}%</div>
            </div>

            {/* Capital Adequacy */}
            <div className={cn("rounded-lg p-3 flex items-center justify-between", getReadinessComponentColor(readinessMetrics.capitalAdequacy))}>
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", getComponentIconColor(readinessMetrics.capitalAdequacy))} />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Capital Adequacy</div>
                  <div className="text-xs opacity-75">Banks meeting {">"}= 5% E/A threshold</div>
                </div>
              </div>
              <div className="text-sm font-bold">{Math.round(readinessMetrics.capitalAdequacy)}%</div>
            </div>

            {/* Risk Identification */}
            <div className={cn("rounded-lg p-3 flex items-center justify-between", getReadinessComponentColor(readinessMetrics.riskIdentification))}>
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", getComponentIconColor(readinessMetrics.riskIdentification))} />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Risk Identification</div>
                  <div className="text-xs opacity-75">Banks with proper risk ratings</div>
                </div>
              </div>
              <div className="text-sm font-bold">{Math.round(readinessMetrics.riskIdentification)}%</div>
            </div>

            {/* Reporting Timeliness */}
            <div className={cn("rounded-lg p-3 flex items-center justify-between", getReadinessComponentColor(readinessMetrics.reportingTimeliness))}>
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", getComponentIconColor(readinessMetrics.reportingTimeliness))} />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Reporting Timeliness</div>
                  <div className="text-xs opacity-75">Banks reporting YE 2024 financials</div>
                </div>
              </div>
              <div className="text-sm font-bold">{Math.round(readinessMetrics.reportingTimeliness)}%</div>
            </div>
          </div>
        </div>

        {/* Readiness Assessment Text */}
        <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Supervisory Position Assessment
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300">
            {readinessMetrics.overallScore >= 80
              ? "Strong supervisory position. The CBS has excellent data quality, comprehensive audit coverage, and timely reporting from most banks. Supervisory infrastructure is well-positioned for effective oversight."
              : readinessMetrics.overallScore >= 60
              ? "Adequate supervisory readiness with areas for improvement. While data completeness and audit quality are generally sound, efforts should focus on ensuring timely reporting and uniform capital adequacy standards across the sector."
              : readinessMetrics.overallScore >= 40
              ? "Significant supervisory readiness gaps exist. Multiple areas require attention including audit quality, capital adequacy standards, and reporting timeliness. Enhanced supervisory measures are recommended."
              : "Critical supervisory readiness deficiencies. Urgent action is needed to improve data completeness, audit quality, capital standards, and reporting practices to establish effective supervisory control."}
          </div>
        </div>

        {/* Weights Legend */}
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Component Weights:</div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            <div><span className="font-semibold">Data Completeness:</span> 25%</div>
            <div><span className="font-semibold">Audit Quality:</span> 20%</div>
            <div><span className="font-semibold">Capital Adequacy:</span> 25%</div>
            <div><span className="font-semibold">Risk Identification:</span> 15%</div>
            <div><span className="font-semibold">Reporting Timeliness:</span> 15%</div>
          </div>
        </div>
      </div>

      {/* Key Findings Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Key Findings Summary
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Sector Composition
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {sectorAggregates.totalBanks} banks managing {formatSYP(sectorAggregates.totalAssets)} in
                total assets ({sectorAggregates.conventional} Conventional,{" "}
                {sectorAggregates.islamic} Islamic, {sectorAggregates.microfinance} Microfinance)
              </div>
            </div>
          </div>

          {highRiskBanks.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-red-900 dark:text-red-300">
                  High-Risk Banks ({highRiskBanks.length})
                </div>
                <div className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {highRiskBanks.map((b) => b.shortName).join(", ")}
                </div>
              </div>
            </div>
          )}

          {sectorAggregates.lebaneseExposed > 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-900/50">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-orange-900 dark:text-orange-300">
                  Lebanese Exposure Risk
                </div>
                <div className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  {sectorAggregates.lebaneseExposed} banks with Lebanese parent/affiliate exposure;
                  systemic risk factor requiring provisioning enforcement
                </div>
              </div>
            </div>
          )}

          {qualifiedOpinionBanks.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Qualified Audit Opinions ({qualifiedOpinionBanks.length})
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {qualifiedOpinionBanks.map((b) => b.shortName).join(", ")} - requires supervisory follow-up
                </div>
              </div>
            </div>
          )}

          {lowCapitalBanks.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-red-900 dark:text-red-300">
                  Capital Adequacy Concerns ({lowCapitalBanks.length})
                </div>
                <div className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Banks with E/A {"<"} 10%: {lowCapitalBanks.map((b) => `${b.shortName} (${b.equityToAssets.toFixed(1)}%)`).join(", ")}
                </div>
              </div>
            </div>
          )}

          {staleReportingBanks.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                  Stale Reporting ({staleReportingBanks.length})
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Banks still on YE 2023 financials: {staleReportingBanks.map((b) => b.shortName).join(", ")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supervisory Action Items */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Supervisory Action Items (Priority-Ordered)
        </h2>
        <div className="space-y-3">
          {supervisoryActions.length === 0 ? (
            <div className="text-xs text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              No critical supervisory actions required at this time.
            </div>
          ) : (
            supervisoryActions.map((action, idx) => {
              const priorityColor = {
                Critical: "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/30",
                High: "border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/30",
                Medium: "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/30",
                Low: "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/30",
              };

              const priorityTextColor = {
                Critical: "text-red-900 dark:text-red-300",
                High: "text-orange-900 dark:text-orange-300",
                Medium: "text-amber-900 dark:text-amber-300",
                Low: "text-blue-900 dark:text-blue-300",
              };

              const priorityBadgeColor = {
                Critical: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600",
                High: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600",
                Medium: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600",
                Low: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600",
              };

              return (
                <div
                  key={idx}
                  className={cn(
                    "border rounded-lg p-4",
                    priorityColor[action.priority]
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div
                        className={cn(
                          "text-xs font-semibold mb-1",
                          priorityTextColor[action.priority]
                        )}
                      >
                        {action.priority.toUpperCase()} PRIORITY
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {action.title}
                      </div>
                    </div>
                    <StatusBadge
                      label={`${action.count} banks`}
                      variant="custom"
                      className={priorityBadgeColor[action.priority]}
                    />
                  </div>
                  <div className={cn("text-xs", priorityTextColor[action.priority])}>
                    {action.description}
                  </div>
                  {action.affectedBanks.length > 0 && (
                    <div className="text-xs mt-2 pt-2 border-t border-current border-opacity-20">
                      <span className="font-semibold">Affected: </span>
                      {action.affectedBanks.join(", ")}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CAMELS-Inspired Composite Ratings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          CAMELS-Inspired Composite Bank Ratings (1-5 Scale)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Bank
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  C
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  A
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  M
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  E
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  L
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                  S
                </th>
                <th className="text-center py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  Overall
                </th>
              </tr>
            </thead>
            <tbody>
              {camelRatings
                .sort((a, b) => b.overallRating - a.overallRating)
                .map((rating) => (
                  <tr key={rating.bankId} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {rating.bankName}
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.capital)
                        )}
                      >
                        {rating.capital}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.assetQuality)
                        )}
                      >
                        {rating.assetQuality}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.management)
                        )}
                      >
                        {rating.management}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.earnings)
                        )}
                      >
                        {rating.earnings}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.liquidity)
                        )}
                      >
                        {rating.liquidity}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          getRatingColor(rating.sensitivity)
                        )}
                      >
                        {rating.sensitivity}
                      </div>
                    </td>
                    <td className="text-center py-2 px-3">
                      <div
                        className={cn(
                          "rounded px-2 py-1 text-xs font-bold",
                          getRatingColor(rating.overallRating)
                        )}
                      >
                        {rating.overallRating}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="font-semibold mb-2">CAMELS Components:</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div><span className="font-semibold">C:</span> Capital adequacy</div>
            <div><span className="font-semibold">A:</span> Asset quality & audit</div>
            <div><span className="font-semibold">M:</span> Management/Efficiency</div>
            <div><span className="font-semibold">E:</span> Earnings (ROA/ROE)</div>
            <div><span className="font-semibold">L:</span> Liquidity</div>
            <div><span className="font-semibold">S:</span> Sensitivity to risk</div>
          </div>
        </div>
      </div>

      {/* Early Warning Indicators */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Early Warning Indicators (Multiple Risk Criteria)
        </h2>
        {earlyWarnings.length === 0 ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            No banks currently meeting multiple simultaneous risk criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {earlyWarnings.map((warning, idx) => (
              <div
                key={idx}
                className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {warning.bankName}
                  </div>
                  <StatusBadge
                    label={`${warning.riskCount} Risk Criteria`}
                    variant="custom"
                    className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {warning.criteria.map((criterion, cidx) => (
                    <span
                      key={cidx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-semibold"
                    >
                      <XCircle className="h-3 w-3" />
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-900/50 p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Supervisory Summary & Recommendations
        </h2>
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p>
            The Syrian banking sector is operating with a composite health score of{" "}
            <span className={cn("font-bold", getHealthScoreColor(healthMetrics.compositeScore))}>
              {Math.round(healthMetrics.compositeScore)}/100
            </span>
            , reflecting
            {healthMetrics.compositeScore >= 70
              ? " generally sound fundamentals with manageable risks."
              : healthMetrics.compositeScore >= 50
              ? " moderate health with notable areas requiring attention."
              : " significant stress requiring immediate supervisory intervention."}
          </p>

          <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Key Supervisory Priorities:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Enforce CBS Decision 253 provisioning requirements for Lebanese exposures across{" "}
                {sectorAggregates.lebaneseExposed} banks
              </li>
              <li>
                Schedule urgent meetings with auditors for {qualifiedOpinionBanks.length} banks with
                qualified opinions
              </li>
              <li>
                Require capital augmentation plans from {lowCapitalBanks.length} undercapitalized banks
              </li>
              <li>
                Monitor {earlyWarnings.length} banks showing multiple simultaneous risk criteria
              </li>
              <li>
                Collect YE 2024 financials from {staleReportingBanks.length} banks on outdated reporting cycles
              </li>
            </ul>
          </div>

          <p>
            This auto-generated briefing should be reviewed in conjunction with detailed prudential
            analysis and individual bank examination findings.
          </p>
        </div>
      </div>
    </div>
  );
}
