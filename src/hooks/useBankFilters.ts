import { useState, useMemo } from "react";
import type { BankData, FilterState } from "../types";

const defaultFilters: FilterState = {
  search: "",
  bankType: "All",
  riskLevel: "All",
  auditOpinion: "All",
  sortBy: "totalAssets",
  sortDir: "desc",
};

export function useBankFilters(banks: BankData[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredBanks = useMemo(() => {
    let result = [...banks];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.shortName.toLowerCase().includes(q) ||
          b.auditor.toLowerCase().includes(q)
      );
    }

    if (filters.bankType !== "All") {
      result = result.filter((b) => b.type === filters.bankType);
    }

    if (filters.riskLevel !== "All") {
      result = result.filter((b) => b.riskRating === filters.riskLevel);
    }

    if (filters.auditOpinion !== "All") {
      result = result.filter((b) => b.auditOpinion === filters.auditOpinion);
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return filters.sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return filters.sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [banks, filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const toggleSort = (field: keyof BankData) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
    }));
  };

  return { filters, filteredBanks, updateFilter, resetFilters, toggleSort };
}
