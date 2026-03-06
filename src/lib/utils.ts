import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BankData } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSYP(value: number): string {
  if (Math.abs(value) >= 1e9) return `SYP ${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `SYP ${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `SYP ${(value / 1e3).toFixed(0)}K`;
  return `SYP ${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getRiskColor(rating: string): string {
  switch (rating) {
    case "Low": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
    case "High": return "text-red-600 bg-red-50 border-red-200";
    case "Critical": return "text-red-800 bg-red-100 border-red-300";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getAuditColor(opinion: string): string {
  switch (opinion) {
    case "Clean": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "Qualified": return "text-red-600 bg-red-50 border-red-200";
    case "Emphasis of Matter": return "text-amber-600 bg-amber-50 border-amber-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getMetricStatus(value: number, good: number, caution: number, _danger: number, higherIsBetter: boolean): "good" | "caution" | "danger" {
  if (higherIsBetter) {
    if (value >= good) return "good";
    if (value >= caution) return "caution";
    return "danger";
  } else {
    if (value <= good) return "good";
    if (value <= caution) return "caution";
    return "danger";
  }
}

export function getStatusColor(status: "good" | "caution" | "danger"): string {
  switch (status) {
    case "good": return "text-emerald-600";
    case "caution": return "text-amber-600";
    case "danger": return "text-red-600";
  }
}

export function getStatusBg(status: "good" | "caution" | "danger"): string {
  switch (status) {
    case "good": return "bg-emerald-500";
    case "caution": return "bg-amber-500";
    case "danger": return "bg-red-500";
  }
}

export function getBankTypeColor(type: string): string {
  switch (type) {
    case "Conventional": return "#3b82f6";
    case "Islamic": return "#10b981";
    case "Microfinance": return "#f59e0b";
    default: return "#6b7280";
  }
}

export function calculateHHI(banks: BankData[]): number {
  return banks.reduce((sum, b) => sum + Math.pow(b.sectorShare, 2), 0);
}

export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/** Shared Recharts tooltip style */
export const CHART_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
  fontSize: "12px",
  padding: "8px 12px",
  backgroundColor: "white",
};

/** Shared Recharts grid style */
export const CHART_GRID_STYLE = "#e2e8f0";

/** Chart color palette - banking supervision themed */
export const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
  accent: "#8b5cf6",
  conventional: "#3b82f6",
  islamic: "#10b981",
  microfinance: "#f59e0b",
};
