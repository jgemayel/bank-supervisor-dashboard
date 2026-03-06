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

export const banks: BankData[] = [
  {
    id: 1, name: "Bemo Saudi Fransi (BSFF)", shortName: "BSFF",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 8578643798, equity: 1913000000, netProfit: 146500000,
    customerDeposits: 5700000000, creditFacilities: 860000000, cashAndCBS: 2590000000,
    roa: 1.7, roe: 7.7, equityToAssets: 22.3, costToIncome: 44.2,
    loansToDeposits: 15.1, cashToAssets: 30.2,
    nplRatio: 3.7, capitalAdequacyRatio: null,
    auditOpinion: "Qualified", auditReason: "Lebanese bank exposures - ECL provisions made but adequacy uncertain",
    riskRating: "High", lebaneseExposure: true,
    auditor: "Asaad Salah Sharbati", sectorShare: 17.4,
  },
  {
    id: 2, name: "International Islamic Bank", shortName: "IIB",
    type: "Islamic", reportingPeriod: "YE 2023",
    totalAssets: 7892518177, equity: 709700000, netProfit: 497300000,
    customerDeposits: 3200000000, creditFacilities: 2285000000, cashAndCBS: 4340000000,
    roa: 6.3, roe: 70.1, equityToAssets: 9.0, costToIncome: 21.1,
    loansToDeposits: 71.4, cashToAssets: 55.0,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Emphasis of Matter", auditReason: "ECL models and parameters not updated; differences found on recalculation",
    riskRating: "High", lebaneseExposure: false,
    auditor: "BTC International & Lutfi Al-Salamat", sectorShare: 16.0,
  },
  {
    id: 3, name: "Al Baraka Bank", shortName: "Al Baraka",
    type: "Islamic", reportingPeriod: "YE 2024",
    totalAssets: 7668806993, equity: 977500000, netProfit: 157700000,
    customerDeposits: 3100000000, creditFacilities: 567000000, cashAndCBS: 3213000000,
    roa: 2.1, roe: 16.1, equityToAssets: 12.7, costToIncome: 36.9,
    loansToDeposits: 18.3, cashToAssets: 41.9,
    nplRatio: 28.4, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Dr. Muhammad Imad Al-Darkazanli", sectorShare: 15.6,
  },
  {
    id: 4, name: "Cham Bank (CHB)", shortName: "CHB",
    type: "Islamic", reportingPeriod: "YE 2023",
    totalAssets: 4130550552, equity: 563700000, netProfit: 409600000,
    customerDeposits: 1400000000, creditFacilities: 2906000000, cashAndCBS: 2011000000,
    roa: 9.9, roe: 72.7, equityToAssets: 13.6, costToIncome: 9.9,
    loansToDeposits: 207.6, cashToAssets: 48.7,
    nplRatio: 3.6, capitalAdequacyRatio: 38.0,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Medium", lebaneseExposure: false,
    auditor: "Not identified", sectorShare: 8.4,
  },
  {
    id: 5, name: "Qatar National Bank Syria", shortName: "QNB Syria",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 3517320482, equity: 2374000000, netProfit: 230400000,
    customerDeposits: 790000000, creditFacilities: 162000000, cashAndCBS: 457000000,
    roa: 6.6, roe: 9.7, equityToAssets: 67.5, costToIncome: 21.4,
    loansToDeposits: 20.5, cashToAssets: 13.0,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Deloitte & Touche (Syria)", sectorShare: 7.1,
  },
  {
    id: 6, name: "Bank of Syria and Overseas (BSO)", shortName: "BSO",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 2657559322, equity: 724500000, netProfit: 99200000,
    customerDeposits: 1600000000, creditFacilities: 70000000, cashAndCBS: 1047000000,
    roa: 3.7, roe: 13.7, equityToAssets: 27.3, costToIncome: 44.8,
    loansToDeposits: 4.4, cashToAssets: 39.4,
    nplRatio: 0.0, capitalAdequacyRatio: 22.0,
    auditOpinion: "Qualified", auditReason: "Lebanese bank exposures - ECL provisions but adequacy uncertain",
    riskRating: "High", lebaneseExposure: true,
    auditor: "Al-Samman & Partners", sectorShare: 5.4,
  },
  {
    id: 7, name: "IBTF (Intl Bank for Trade and Finance)", shortName: "IBTF",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 2404968205, equity: 717800000, netProfit: 82800000,
    customerDeposits: 1200000000, creditFacilities: 301000000, cashAndCBS: 567000000,
    roa: 3.4, roe: 11.5, equityToAssets: 29.8, costToIncome: 41.6,
    loansToDeposits: 25.1, cashToAssets: 23.6,
    nplRatio: 4.6, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Al-Samman & Partners", sectorShare: 4.9,
  },
  {
    id: 8, name: "Al Khalij Bank", shortName: "Al Khalij",
    type: "Conventional", reportingPeriod: "YE 2023",
    totalAssets: 2190740571, equity: 520900000, netProfit: 381000000,
    customerDeposits: 1100000000, creditFacilities: 568000000, cashAndCBS: 765000000,
    roa: 17.4, roe: 73.1, equityToAssets: 23.8, costToIncome: 15.2,
    loansToDeposits: 51.6, cashToAssets: 34.9,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Emphasis of Matter", auditReason: "Credit facilities with significant credit risk increase; rescheduling terminated per CBS decisions",
    riskRating: "Medium", lebaneseExposure: false,
    auditor: "Majd al-Din Ahmad al-Shahhan", sectorShare: 4.4,
  },
  {
    id: 9, name: "Ahli Trust Bank (ATB)", shortName: "ATB",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 2176177821, equity: 736900000, netProfit: 61500000,
    customerDeposits: 1100000000, creditFacilities: 274000000, cashAndCBS: 474000000,
    roa: 2.8, roe: 8.3, equityToAssets: 33.9, costToIncome: 57.5,
    loansToDeposits: 24.9, cashToAssets: 21.8,
    nplRatio: 0.0, capitalAdequacyRatio: null,
    auditOpinion: "Qualified", auditReason: "Lebanese bank exposures - ECL provisions but adequacy uncertain",
    riskRating: "High", lebaneseExposure: true,
    auditor: "Asaad Salah Sharbati", sectorShare: 4.4,
  },
  {
    id: 10, name: "Fransa Bank", shortName: "Fransa",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 1640000000, equity: 611600000, netProfit: 16500000,
    customerDeposits: 780000000, creditFacilities: 232000000, cashAndCBS: 497000000,
    roa: 1.0, roe: 2.7, equityToAssets: 37.3, costToIncome: 73.5,
    loansToDeposits: 29.7, cashToAssets: 30.3,
    nplRatio: 0.0, capitalAdequacyRatio: null,
    auditOpinion: "Qualified", auditReason: "Lebanese bank exposures - ECL provisions but adequacy uncertain",
    riskRating: "High", lebaneseExposure: true,
    auditor: "Not clearly identified", sectorShare: 3.3,
  },
  {
    id: 11, name: "Al Arabi Bank", shortName: "Al Arabi",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 1536000000, equity: 726500000, netProfit: 47200000,
    customerDeposits: 620000000, creditFacilities: 78000000, cashAndCBS: 369000000,
    roa: 3.1, roe: 6.5, equityToAssets: 47.3, costToIncome: 56.3,
    loansToDeposits: 12.6, cashToAssets: 24.0,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Not identified", sectorShare: 3.1,
  },
  {
    id: 12, name: "Shahba Bank", shortName: "Shahba",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 1373000000, equity: 789700000, netProfit: 16500000,
    customerDeposits: 420000000, creditFacilities: 122000000, cashAndCBS: 313000000,
    roa: 1.2, roe: 2.1, equityToAssets: 57.7, costToIncome: 80.9,
    loansToDeposits: 29.1, cashToAssets: 22.8,
    nplRatio: 1.1, capitalAdequacyRatio: null,
    auditOpinion: "Qualified", auditReason: "Lebanese bank exposures - only 18.58% provisioned vs 30% CBS requirement",
    riskRating: "High", lebaneseExposure: true,
    auditor: "Dr. Muhammad Imad Al-Darkazanli", sectorShare: 2.8,
  },
  {
    id: 13, name: "Bank of Jordan - Syria", shortName: "BoJ Syria",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 1359000000, equity: 375200000, netProfit: 35800000,
    customerDeposits: 650000000, creditFacilities: 170000000, cashAndCBS: 694000000,
    roa: 2.6, roe: 9.5, equityToAssets: 27.7, costToIncome: 50.7,
    loansToDeposits: 26.2, cashToAssets: 51.1,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Asaad Salah Sharbati", sectorShare: 2.8,
  },
  {
    id: 14, name: "Bank Al Sharq", shortName: "Al Sharq",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 1161000000, equity: 449500000, netProfit: 46400000,
    customerDeposits: 530000000, creditFacilities: 113000000, cashAndCBS: 623000000,
    roa: 4.0, roe: 10.3, equityToAssets: 38.3, costToIncome: 46.0,
    loansToDeposits: 21.3, cashToAssets: 53.7,
    nplRatio: 10.8, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Low", lebaneseExposure: false,
    auditor: "Not identified", sectorShare: 2.4,
  },
  {
    id: 15, name: "National Islamic Bank (NIB)", shortName: "NIB",
    type: "Islamic", reportingPeriod: "YE 2024",
    totalAssets: 987400000, equity: 78800000, netProfit: 5300000,
    customerDeposits: 770000000, creditFacilities: 157000000, cashAndCBS: 800000000,
    roa: 0.5, roe: 6.8, equityToAssets: 8.0, costToIncome: 81.9,
    loansToDeposits: 20.4, cashToAssets: 81.1,
    nplRatio: 13.0, capitalAdequacyRatio: 10.2,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Medium", lebaneseExposure: false,
    auditor: "Dr. Muhammad Imad Al-Darkazanli", sectorShare: 2.0,
  },
  {
    id: 16, name: "Al Wataniya Bank", shortName: "Al Wataniya",
    type: "Conventional", reportingPeriod: "YE 2024",
    totalAssets: 239000, equity: 40000, netProfit: 7000,
    customerDeposits: 96000, creditFacilities: 79000, cashAndCBS: 34000,
    roa: 3.0, roe: 18.0, equityToAssets: 16.9, costToIncome: 76.5,
    loansToDeposits: 82.3, cashToAssets: 14.4,
    nplRatio: 7.2, capitalAdequacyRatio: 23.3,
    auditOpinion: "Qualified", auditReason: "Interest recognized using flat rate method instead of IFRS 9 effective interest rate",
    riskRating: "Medium", lebaneseExposure: false,
    auditor: "Talal Abu-Ghazaleh & Co. (TAG)", sectorShare: 0.0,
  },
  {
    id: 17, name: "Al Awal Bank (First Microfinance)", shortName: "Al Awal MF",
    type: "Microfinance", reportingPeriod: "YE 2024",
    totalAssets: 185000, equity: 17000, netProfit: 9000,
    customerDeposits: 68000, creditFacilities: 80000, cashAndCBS: 18000,
    roa: 4.8, roe: 50.9, equityToAssets: 9.4, costToIncome: 65.9,
    loansToDeposits: 117.0, cashToAssets: 9.8,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "Medium", lebaneseExposure: false,
    auditor: "Not identified", sectorShare: 0.0,
  },
  {
    id: 18, name: "Bemo Microfinance", shortName: "Bemo MF",
    type: "Microfinance", reportingPeriod: "YE 2024",
    totalAssets: 54000, equity: 23000, netProfit: -3000,
    customerDeposits: 8000, creditFacilities: 31000, cashAndCBS: 300,
    roa: -4.6, roe: -10.9, equityToAssets: 42.5, costToIncome: 162.1,
    loansToDeposits: 6693.8, cashToAssets: 0.6,
    nplRatio: null, capitalAdequacyRatio: null,
    auditOpinion: "Clean", auditReason: "",
    riskRating: "High", lebaneseExposure: false,
    auditor: "Al-Samman & Partners", sectorShare: 0.0,
  },
];

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

export const prudentialBenchmarks: PrudentialBenchmark[] = [
  {
    metric: "Capital Adequacy (Equity/Assets)",
    description: "Leverage ratio proxy - equity as share of total assets",
    baselStandard: ">= 3% (Tier 1 Leverage)",
    cbsRequirement: "Decision 253 (Solvency)",
    internationalBest: "8-12% typical for well-capitalized banks",
    unit: "%", thresholdGood: 15, thresholdCaution: 10, thresholdDanger: 8,
    higher_is_better: true,
  },
  {
    metric: "Return on Assets (ROA)",
    description: "Net income relative to average total assets",
    baselStandard: "N/A (profitability metric)",
    cbsRequirement: "N/A",
    internationalBest: "1.0-2.0% typical for stable banking sectors",
    unit: "%", thresholdGood: 1.5, thresholdCaution: 0.5, thresholdDanger: 0,
    higher_is_better: true,
  },
  {
    metric: "Return on Equity (ROE)",
    description: "Net income relative to average shareholders equity",
    baselStandard: "N/A (profitability metric)",
    cbsRequirement: "N/A",
    internationalBest: "10-15% for sustainable banking",
    unit: "%", thresholdGood: 10, thresholdCaution: 5, thresholdDanger: 0,
    higher_is_better: true,
  },
  {
    metric: "Cost-to-Income Ratio",
    description: "Operating expenses as share of operating income",
    baselStandard: "N/A (efficiency metric)",
    cbsRequirement: "N/A",
    internationalBest: "40-60% for efficient banks",
    unit: "%", thresholdGood: 50, thresholdCaution: 70, thresholdDanger: 80,
    higher_is_better: false,
  },
  {
    metric: "Loans-to-Deposits Ratio",
    description: "Total credit facilities relative to customer deposits",
    baselStandard: "Monitored under NSFR framework",
    cbsRequirement: "Decision 395 (Liquidity)",
    internationalBest: "60-80% balanced intermediation",
    unit: "%", thresholdGood: 70, thresholdCaution: 100, thresholdDanger: 120,
    higher_is_better: false,
  },
  {
    metric: "Cash-to-Assets Ratio",
    description: "Cash and CBS balances as share of total assets",
    baselStandard: "LCR >= 100%",
    cbsRequirement: "Decision 395/461 (Liquidity)",
    internationalBest: "15-30% liquid asset buffer",
    unit: "%", thresholdGood: 20, thresholdCaution: 10, thresholdDanger: 5,
    higher_is_better: true,
  },
];

export const sectorAggregates = {
  totalBanks: 18,
  conventional: 12,
  islamic: 4,
  microfinance: 2,
  totalAssets: 49275186996,
  totalEquity: 12267209519,
  totalDeposits: 22053880801,
  totalCredit: 6308074554,
  totalNetProfit: 2233744385,
  totalCash: 18800000000,
  wtdAvgROA: 4.5,
  wtdAvgROE: 18.2,
  wtdAvgEquityToAssets: 24.9,
  cleanOpinions: 10,
  qualifiedOpinions: 6,
  emphasisOfMatter: 2,
  lebaneseExposed: 5,
  top5Concentration: 64.5,
};

export function formatSYP(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toString();
}
