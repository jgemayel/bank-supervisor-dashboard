import { useState } from "react";
import { banks } from "../data/banks";
import { lebaneseExposureData, dataGaps } from "../data/lebanese-exposure";
import { cn, formatSYP } from "../lib/utils";
import {
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  Database,
} from "lucide-react";

export function RiskPage() {
  const [activeTab, setActiveTab] = useState<
    "audit" | "lebanese" | "gaps"
  >("audit");

  const highRiskBanks = banks.filter((b) => b.riskRating === "High");
  const qualifiedBanks = banks.filter((b) => b.auditOpinion === "Qualified");
  const emphasisBanks = banks.filter(
    (b) => b.auditOpinion === "Emphasis of Matter"
  );
  const exposedBanks = banks.filter((b) => b.lebaneseExposure);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card-surface p-4 border-l-4 border-red-600">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
              High Risk
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {highRiskBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
            {highRiskBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="card-surface p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1.5">
            <FileWarning className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
              Qualified
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {qualifiedBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
            {qualifiedBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="card-surface p-4 border-l-4 border-amber-600">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
              Emphasis
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {emphasisBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
            {emphasisBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="card-surface p-4 border-l-4 border-purple-600">
          <div className="flex items-center gap-2 mb-1.5">
            <Database className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">
              Lebanese
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {exposedBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
            {(
              (exposedBanks.reduce((sum, b) => sum + b.totalAssets, 0) /
                1e9) *
              100
            ).toFixed(0)}
            % of sector assets
          </p>
        </div>

        <div className="card-surface p-4 border-l-4 border-orange-600">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">
              Elevated NPL
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            {banks.filter(b => b.nplRatio !== null && b.nplRatio > 5).length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
            NPL ratio above 5%
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b-2 border-slate-200 dark:border-slate-700">
        {[
          { id: "audit" as const, label: "Audit Opinions", icon: FileWarning },
          {
            id: "lebanese" as const,
            label: "Lebanese Exposure",
            icon: AlertTriangle,
          },
          { id: "gaps" as const, label: "Data Gaps", icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-0.5",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Audit Opinion Distribution
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Bank
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Opinion
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Reason
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Auditor
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Assets
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      NPL%
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {banks
                    .sort((a, b) => b.totalAssets - a.totalAssets)
                    .map((bank) => {
                      let opinionColor = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
                      if (bank.auditOpinion === "Qualified") {
                        opinionColor = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
                      } else if (bank.auditOpinion === "Emphasis of Matter") {
                        opinionColor = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
                      }
                      return (
                        <tr
                          key={bank.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                            {bank.shortName}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                                opinionColor
                              )}
                            >
                              {bank.auditOpinion}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs">
                            {bank.auditReason || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {bank.auditor}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatSYP(bank.totalAssets)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {bank.nplRatio === null ? (
                              <span className="text-slate-400 dark:text-slate-500">—</span>
                            ) : bank.nplRatio > 10 ? (
                              <span className="text-red-600 dark:text-red-400 font-semibold">{bank.nplRatio.toFixed(1)}%</span>
                            ) : bank.nplRatio > 5 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">{bank.nplRatio.toFixed(1)}%</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{bank.nplRatio.toFixed(1)}%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Clean: {banks.filter((b) => b.auditOpinion === "Clean").length} banks
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Qualified: {qualifiedBanks.length} banks
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Emphasis: {emphasisBanks.length} banks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lebanese Exposure Tab */}
      {activeTab === "lebanese" && (
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300">
                  Systemic Risk: Lebanese Bank Exposures
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Five institutions maintain exposures to Lebanese parent or correspondent banks. CBS Decision mandates minimum 30% specific provisioning. Shahba Bank critically non-compliant. ECL adequacy uncertain for BSFF, BSO, ATB, Fransa.
                </p>
              </div>
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Lebanese Exposure Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Bank
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Lebanese Affiliate
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Provisioning Status
                    </th>
                    <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Compliance
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Assets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lebaneseExposureData.map((exp) => {
                    const bank = banks.find(
                      (b) => b.shortName === exp.bankShortName
                    );
                    const complianceColor =
                      exp.complianceStatus === "Non-Compliant"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : exp.complianceStatus === "Partial"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
                    return (
                      <tr
                        key={exp.bankShortName}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {exp.bankShortName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {exp.parentAffiliation}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[10px]">
                          {exp.provisioningStatus}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                              complianceColor
                            )}
                          >
                            {exp.complianceStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {bank ? formatSYP(bank.totalAssets) : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Gaps Tab */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                  Data Availability Assessment
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Current assessment uses published financial statements (IFRS-based). Six key prudential metrics required under Basel III Pillar 3 remain unavailable without regulatory reporting system.
                </p>
              </div>
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Missing Prudential Data (Basel III Requirements)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Metric
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Description
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      Basel Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataGaps.map((gap, idx) => {
                    const statusColor =
                      gap.status === "Missing"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : gap.status === "Partial"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
                    return (
                      <tr
                        key={idx}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {gap.metric}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                              statusColor
                            )}
                          >
                            {gap.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {gap.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[10px] font-mono">
                          {gap.baselReference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
