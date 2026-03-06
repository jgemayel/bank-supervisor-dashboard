import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { banks, prudentialBenchmarks } from "../data/banks";
import { cn, getMetricStatus } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import type { BankData } from "../data/banks";

type SortBy = keyof BankData;
type SortDir = "asc" | "desc";

export function BanksPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [auditFilter, setAuditFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortBy>("totalAssets");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Filter banks
  let filtered = banks.filter((bank) => {
    const matchesSearch = search === "" ||
      bank.shortName.toLowerCase().includes(search.toLowerCase()) ||
      bank.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || bank.type === typeFilter;
    const matchesRisk = riskFilter === "All" || bank.riskRating === riskFilter;
    const matchesAudit = auditFilter === "All" || bank.auditOpinion === auditFilter;
    return matchesSearch && matchesType && matchesRisk && matchesAudit;
  });

  // Sort banks
  filtered.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    // Handle null values - push nulls to end
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortBy }) => {
    if (sortBy !== field)
      return <ChevronUp className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ChevronDown className="h-3 w-3 text-blue-600" />
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Conventional":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Islamic":
        return "bg-green-50 text-green-700 border-green-200";
      case "Microfinance":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getMetricColor = (value: number, metricType: string) => {
    const bench = prudentialBenchmarks.find((b) => {
      const metric = b.metric.toLowerCase();
      return (
        (metricType === "E/A" && metric.includes("capital")) ||
        (metricType === "ROA" && metric.includes("return on assets")) ||
        (metricType === "ROE" && metric.includes("return on equity")) ||
        (metricType === "C/I" && metric.includes("cost")) ||
        (metricType === "L/D" && metric.includes("loans")) ||
        (metricType === "Cash/A" && metric.includes("cash"))
      );
    });

    if (!bench) return "";

    const status = getMetricStatus(
      value,
      bench.thresholdGood,
      bench.thresholdCaution,
      bench.thresholdDanger,
      bench.higher_is_better
    );

    switch (status) {
      case "good":
        return "bg-emerald-50 text-emerald-700";
      case "caution":
        return "bg-amber-50 text-amber-600";
      case "danger":
        return "text-red-700 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3 animate-enter">
      {/* Filter Bar - Compact inline design */}
      <div className="card-surface p-3 flex gap-2 items-center flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search banks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option>All Types</option>
          <option>Conventional</option>
          <option>Islamic</option>
          <option>Microfinance</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option>All Risk</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>

        <select
          value={auditFilter}
          onChange={(e) => setAuditFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option>All Audits</option>
          <option>Clean</option>
          <option>Qualified</option>
          <option>Emphasis of Matter</option>
        </select>

        <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-auto">
          Showing {filtered.length} of {banks.length}
        </div>
      </div>

      {/* Dense Data Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8 text-center cursor-default">#</th>
                <th className="text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("shortName")}>
                  <div className="flex items-center gap-1">
                    Bank <SortIcon field="shortName" />
                  </div>
                </th>
                <th className="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("type")}>
                  <div className="flex items-center justify-center gap-1">
                    Type <SortIcon field="type" />
                  </div>
                </th>
                <th className="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("reportingPeriod")}>
                  <div className="flex items-center justify-center gap-1">
                    Period <SortIcon field="reportingPeriod" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("totalAssets")}>
                  <div className="flex items-center justify-end gap-1">
                    Total Assets <SortIcon field="totalAssets" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("equity")}>
                  <div className="flex items-center justify-end gap-1">
                    Equity <SortIcon field="equity" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("netProfit")}>
                  <div className="flex items-center justify-end gap-1">
                    Net Profit <SortIcon field="netProfit" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("equityToAssets")}>
                  <div className="flex items-center justify-end gap-1">
                    E/A% <SortIcon field="equityToAssets" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("roa")}>
                  <div className="flex items-center justify-end gap-1">
                    ROA% <SortIcon field="roa" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("roe")}>
                  <div className="flex items-center justify-end gap-1">
                    ROE% <SortIcon field="roe" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("costToIncome")}>
                  <div className="flex items-center justify-end gap-1">
                    C/I% <SortIcon field="costToIncome" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("loansToDeposits")}>
                  <div className="flex items-center justify-end gap-1">
                    L/D% <SortIcon field="loansToDeposits" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("cashToAssets")}>
                  <div className="flex items-center justify-end gap-1">
                    Cash/A% <SortIcon field="cashToAssets" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("nplRatio")}>
                  <div className="flex items-center justify-end gap-1">
                    NPL% <SortIcon field="nplRatio" />
                  </div>
                </th>
                <th className="numeric cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("capitalAdequacyRatio")}>
                  <div className="flex items-center justify-end gap-1">
                    CAR% <SortIcon field="capitalAdequacyRatio" />
                  </div>
                </th>
                <th className="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("auditOpinion")}>
                  <div className="flex items-center justify-center gap-1">
                    Audit <SortIcon field="auditOpinion" />
                  </div>
                </th>
                <th className="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort("riskRating")}>
                  <div className="flex items-center justify-center gap-1">
                    Risk <SortIcon field="riskRating" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bank, idx) => (
                <tr
                  key={bank.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    idx % 2 === 0 ? "bg-white dark:bg-slate-800/50" : "bg-slate-50/50 dark:bg-slate-900/20"
                  )}
                  onClick={() => navigate(`/profiles?bank=${bank.id}`)}
                >
                  <td className="text-center text-slate-500 dark:text-slate-400">{idx + 1}</td>
                  <td className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {bank.shortName}
                  </td>
                  <td className="text-center">
                    <span className={cn("inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded border", getTypeColor(bank.type))}>
                      {bank.type === "Conventional" ? "C" : bank.type === "Islamic" ? "I" : "MF"}
                    </span>
                  </td>
                  <td className="text-center text-xs text-slate-600 dark:text-slate-400">{bank.reportingPeriod}</td>
                  <td className={cn("numeric text-xs", getMetricColor(bank.totalAssets, "Total"))}>
                    {(bank.totalAssets / 1e9).toFixed(1)}B
                  </td>
                  <td className={cn("numeric text-xs", getMetricColor(bank.equity, "Equity"))}>
                    {(bank.equity / 1e6).toFixed(0)}M
                  </td>
                  <td className={cn("numeric text-xs", bank.netProfit < 0 ? "text-red-700" : "")}>
                    {bank.netProfit < 0 ? "-" : ""}{Math.abs(bank.netProfit / 1e6).toFixed(0)}M
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.equityToAssets, "E/A"))}>
                    {bank.equityToAssets.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.roa, "ROA"))}>
                    {bank.roa.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.roe, "ROE"))}>
                    {bank.roe.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.costToIncome, "C/I"))}>
                    {bank.costToIncome.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.loansToDeposits, "L/D"))}>
                    {bank.loansToDeposits.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", getMetricColor(bank.cashToAssets, "Cash/A"))}>
                    {bank.cashToAssets.toFixed(1)}
                  </td>
                  <td className={cn("numeric text-xs font-mono", bank.nplRatio !== null ? (bank.nplRatio > 10 ? "text-red-700 font-semibold" : bank.nplRatio > 5 ? "text-amber-600" : "bg-emerald-50 text-emerald-700") : "text-slate-400")}>
                    {bank.nplRatio !== null ? bank.nplRatio.toFixed(1) : "—"}
                  </td>
                  <td className={cn("numeric text-xs font-mono", bank.capitalAdequacyRatio !== null ? (bank.capitalAdequacyRatio < 12 ? "text-red-700 font-semibold" : "text-slate-700 dark:text-slate-300") : "text-slate-400")}>
                    {bank.capitalAdequacyRatio !== null ? bank.capitalAdequacyRatio.toFixed(1) : "—"}
                  </td>
                  <td className="text-center">
                    <span className={cn(
                      "inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap",
                      bank.auditOpinion === "Clean"
                        ? "bg-emerald-100 text-emerald-700"
                        : bank.auditOpinion === "Qualified"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {bank.auditOpinion === "Clean" ? "✓" : bank.auditOpinion === "Qualified" ? "✗" : "!"}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={cn(
                      "inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded",
                      bank.riskRating === "Low"
                        ? "bg-emerald-100 text-emerald-700"
                        : bank.riskRating === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : bank.riskRating === "High"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                    )}>
                      {bank.riskRating[0]}
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
