export interface BankData {
  id: number;
  name: string;
  shortName: string;
  type: "Conventional" | "Islamic" | "Microfinance";
  reportingPeriod: string;
  totalAssets: number;
  equity: number;
  netProfit: number;
  customerDeposits: number;
  creditFacilities: number;
  cashAndCBS: number;
  roa: number;
  roe: number;
  equityToAssets: number;
  costToIncome: number;
  loansToDeposits: number;
  cashToAssets: number;
  nplRatio: number | null;
  capitalAdequacyRatio: number | null;
  auditOpinion: "Clean" | "Qualified" | "Emphasis of Matter";
  auditReason: string;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  lebaneseExposure: boolean;
  auditor: string;
  sectorShare: number;
}

export interface PrudentialBenchmark {
  metric: string;
  description: string;
  baselStandard: string;
  cbsRequirement: string;
  internationalBest: string;
  unit: string;
  thresholdGood: number;
  thresholdCaution: number;
  thresholdDanger: number;
  higher_is_better: boolean;
}

export interface SectorAggregates {
  totalBanks: number;
  conventional: number;
  islamic: number;
  microfinance: number;
  totalAssets: number;
  totalEquity: number;
  totalDeposits: number;
  totalCredit: number;
  totalNetProfit: number;
  totalCash: number;
  wtdAvgROA: number;
  wtdAvgROE: number;
  wtdAvgEquityToAssets: number;
  cleanOpinions: number;
  qualifiedOpinions: number;
  emphasisOfMatter: number;
  lebaneseExposed: number;
  top5Concentration: number;
}

export type SortDirection = "asc" | "desc";
export type BankType = "All" | "Conventional" | "Islamic" | "Microfinance";
export type RiskLevel = "All" | "Low" | "Medium" | "High" | "Critical";
export type AuditOpinionType = "All" | "Clean" | "Qualified" | "Emphasis of Matter";

export interface FilterState {
  search: string;
  bankType: BankType;
  riskLevel: RiskLevel;
  auditOpinion: AuditOpinionType;
  sortBy: keyof BankData;
  sortDir: SortDirection;
}

export interface LebaneseExposureData {
  bankShortName: string;
  parentAffiliation: string;
  provisioningStatus: string;
  complianceStatus: "Compliant" | "Partial" | "Non-Compliant";
}

export interface DataGap {
  metric: string;
  status: "Available" | "Partial" | "Missing";
  description: string;
  baselReference: string;
}
