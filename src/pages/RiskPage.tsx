import { useState } from "react";
import { banks } from "../data/banks";
import { lebaneseExposureData, dataGaps } from "../data/lebanese-exposure";
import { StatusBadge } from "../components/StatusBadge";
import { cn, formatSYP } from "../lib/utils";
import {
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function RiskPage() {
  const [activeTab, setActiveTab] = useState<
    "audit" | "lebanese" | "gaps"
  >("audit");

  const highRiskBanks = banks.filter((b) => b.riskRating === "High");
  const qualifiedBanks = banks.filter((b) => b.auditOpinion === "Qualified");
  const emphasisBanks = banks.filter(
    (b) => b.auditOpinion === "Emphasis of Matter"
  );

  const auditData = banks
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .map((b) => ({
      name: b.shortName,
      assets: b.totalAssets,
      opinion: b.auditOpinion,
    }));

  const exposedBanks = banks.filter((b) => b.lebaneseExposure);
  const totalExposedAssets = exposedBanks.reduce(
    (sum, b) => sum + b.totalAssets,
    0
  );

  return (
    <div className="space-y-6">
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase">
              High Risk Banks
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {highRiskBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {highRiskBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase">
              Qualified Opinions
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {qualifiedBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {qualifiedBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase">
              Emphasis of Matter
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {emphasisBanks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {emphasisBanks.map((b) => b.shortName).join(", ")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">
              Lebanese Exposure
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {exposedBanks.length} banks
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatSYP(totalExposedAssets)} in total assets
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "audit" as const, label: "Audit Opinions", icon: FileWarning },
          { id: "lebanese" as const, label: "Lebanese Exposure", icon: AlertTriangle },
          { id: "gaps" as const, label: "Data Gaps", icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Audit Opinions by Bank (ordered by asset size)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={auditData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1e9
                        ? `${(v / 1e9).toFixed(0)}B`
                        : `${(v / 1e6).toFixed(0)}M`
                    }
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatSYP(value),
                      "Total Assets",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="assets" radius={[4, 4, 0, 0]}>
                    {auditData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.opinion === "Clean"
                            ? "#10b981"
                            : entry.opinion === "Qualified"
                            ? "#ef4444"
                            : "#f59e0b"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                Clean
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500" />
                Qualified
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500" />
                Emphasis of Matter
              </div>
            </div>
          </div>

          {/* Detailed Audit Findings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Audit Findings Detail
            </h3>
            <div className="space-y-3">
              {banks
                .filter((b) => b.auditOpinion !== "Clean")
                .sort((a, b) => b.totalAssets - a.totalAssets)
                .map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                  >
                    <StatusBadge label={bank.auditOpinion} variant="audit" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {bank.shortName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {bank.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {bank.auditReason}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Auditor: {bank.auditor}</span>
                        <span>Period: {bank.reportingPeriod}</span>
                        <span>Assets: {formatSYP(bank.totalAssets)}</span>
                      </div>
                    </div>
                    <StatusBadge label={bank.riskRating} variant="risk" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Lebanese Exposure Tab */}
      {activeTab === "lebanese" && (
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
                  Systemic Risk: Lebanese Bank Exposure
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Following the Lebanese financial crisis, 5 Syrian banks maintain
                  significant exposure to Lebanese parent or correspondent banks.
                  CBS Decision requires minimum 30% provisioning for these
                  exposures. ECL adequacy remains uncertain for most affected banks.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Affected Banks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-3 font-medium text-slate-600 dark:text-slate-300">
                      Bank
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600 dark:text-slate-300">
                      Lebanese Parent/Affiliate
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600 dark:text-slate-300">
                      Provisioning Status
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-slate-600 dark:text-slate-300">
                      CBS Compliance
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600 dark:text-slate-300">
                      Total Assets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lebaneseExposureData.map((exp) => {
                    const bank = banks.find(
                      (b) => b.shortName === exp.bankShortName
                    );
                    return (
                      <tr
                        key={exp.bankShortName}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {exp.bankShortName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {exp.parentAffiliation}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {exp.provisioningStatus}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge
                            label={exp.complianceStatus}
                            variant="custom"
                            className={
                              exp.complianceStatus === "Non-Compliant"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
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
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Data Availability Assessment
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Comparison of available data against Basel III/BCBS disclosure
                  requirements. Several key prudential metrics are not disclosed in
                  published financial statements and would require regulatory
                  reporting data (COREP/FINREP equivalent) for full assessment.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Missing Prudential Data (Basel III Requirements)
            </h3>
            <div className="space-y-3">
              {dataGaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                >
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
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
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {gap.metric}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {gap.description}
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                      Basel reference: {gap.baselReference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
