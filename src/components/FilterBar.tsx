import { Search, X, RotateCcw } from "lucide-react";
import type { FilterState, BankType, RiskLevel, AuditOpinionType } from "../types";

interface FilterBarProps {
  filters: FilterState;
  onUpdate: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  filters,
  onUpdate,
  onReset,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.bankType !== "All" ||
    filters.riskLevel !== "All" ||
    filters.auditOpinion !== "All";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search banks..."
            value={filters.search}
            onChange={(e) => onUpdate("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => onUpdate("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={filters.bankType}
          onChange={(e) => onUpdate("bankType", e.target.value as BankType)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="All">All Types</option>
          <option value="Conventional">Conventional</option>
          <option value="Islamic">Islamic</option>
          <option value="Microfinance">Microfinance</option>
        </select>

        <select
          value={filters.riskLevel}
          onChange={(e) => onUpdate("riskLevel", e.target.value as RiskLevel)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="All">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        <select
          value={filters.auditOpinion}
          onChange={(e) =>
            onUpdate("auditOpinion", e.target.value as AuditOpinionType)
          }
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="All">All Audit Opinions</option>
          <option value="Clean">Clean</option>
          <option value="Qualified">Qualified</option>
          <option value="Emphasis of Matter">Emphasis of Matter</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}

        <span className="text-xs text-slate-500 ml-auto">
          Showing {resultCount} of {totalCount} banks
        </span>
      </div>
    </div>
  );
}
