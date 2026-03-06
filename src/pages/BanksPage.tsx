import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { banks } from "../data/banks";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge } from "../components/StatusBadge";
import { useBankFilters } from "../hooks/useBankFilters";
import { formatSYP, cn } from "../lib/utils";
import type { BankData } from "../types";
import { useNavigate } from "react-router-dom";

type Column = {
  key: keyof BankData;
  label: string;
  format?: (val: any, bank: BankData) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
};

const columns: Column[] = [
  {
    key: "shortName",
    label: "Bank",
    format: (val, bank) => (
      <div>
        <p className="font-medium text-slate-900">{val}</p>
        <p className="text-[10px] text-slate-500">{bank.type}</p>
      </div>
    ),
    align: "left",
    width: "140px",
  },
  {
    key: "totalAssets",
    label: "Total Assets",
    format: (val) => <span className="font-mono text-xs">{formatSYP(val)}</span>,
    align: "right",
  },
  {
    key: "equity",
    label: "Equity",
    format: (val) => <span className="font-mono text-xs">{formatSYP(val)}</span>,
    align: "right",
  },
  {
    key: "netProfit",
    label: "Net Profit",
    format: (val) => (
      <span className={cn("font-mono text-xs", val < 0 && "text-red-600")}>
        {formatSYP(val)}
      </span>
    ),
    align: "right",
  },
  {
    key: "roa",
    label: "ROA",
    format: (val) => <span className="font-mono text-xs">{val.toFixed(1)}%</span>,
    align: "right",
  },
  {
    key: "roe",
    label: "ROE",
    format: (val) => <span className="font-mono text-xs">{val.toFixed(1)}%</span>,
    align: "right",
  },
  {
    key: "equityToAssets",
    label: "E/A",
    format: (val) => (
      <span
        className={cn(
          "font-mono text-xs",
          val < 10 ? "text-red-600 font-semibold" : ""
        )}
      >
        {val.toFixed(1)}%
      </span>
    ),
    align: "right",
  },
  {
    key: "costToIncome",
    label: "C/I",
    format: (val) => (
      <span
        className={cn(
          "font-mono text-xs",
          val > 80 ? "text-red-600 font-semibold" : val > 60 ? "text-amber-600" : ""
        )}
      >
        {val.toFixed(1)}%
      </span>
    ),
    align: "right",
  },
  {
    key: "loansToDeposits",
    label: "L/D",
    format: (val) => <span className="font-mono text-xs">{val.toFixed(1)}%</span>,
    align: "right",
  },
  {
    key: "auditOpinion",
    label: "Audit",
    format: (val) => <StatusBadge label={val} variant="audit" />,
    align: "center",
  },
  {
    key: "riskRating",
    label: "Risk",
    format: (val) => <StatusBadge label={val} variant="risk" />,
    align: "center",
  },
  {
    key: "reportingPeriod",
    label: "Period",
    format: (val) => (
      <span
        className={cn(
          "text-xs",
          val === "YE 2023" ? "text-amber-600 font-medium" : "text-slate-600"
        )}
      >
        {val}
      </span>
    ),
    align: "center",
  },
];

export function BanksPage() {
  const { filters, filteredBanks, updateFilter, resetFilters, toggleSort } =
    useBankFilters(banks);
  const navigate = useNavigate();

  const SortIcon = ({ field }: { field: keyof BankData }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
    return filters.sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600" />
    );
  };

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onUpdate={updateFilter}
        onReset={resetFilters}
        resultCount={filteredBanks.length}
        totalCount={banks.length}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "py-3 px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                    style={{ minWidth: col.width }}
                    onClick={() => toggleSort(col.key)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      {col.label}
                      <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map((bank) => (
                <tr
                  key={bank.id}
                  className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profiles?bank=${bank.id}`)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-2.5 px-3",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.format
                        ? col.format(bank[col.key], bank)
                        : String(bank[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredBanks.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No banks match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
