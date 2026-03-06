import type { LebaneseExposureData, DataGap } from "../types";

export const lebaneseExposureData: LebaneseExposureData[] = [
  { bankShortName: "BSFF", parentAffiliation: "Banque Bemo Saudi Fransi (Lebanon)", provisioningStatus: "ECL provisions made, adequacy uncertain", complianceStatus: "Partial" },
  { bankShortName: "BSO", parentAffiliation: "Bank of Beirut (Lebanon)", provisioningStatus: "ECL provisions made, adequacy uncertain", complianceStatus: "Partial" },
  { bankShortName: "ATB", parentAffiliation: "Bank Audi / Ahli Trust Group", provisioningStatus: "ECL provisions made, adequacy uncertain", complianceStatus: "Partial" },
  { bankShortName: "Fransa", parentAffiliation: "Fransa Bank SAL (Lebanon)", provisioningStatus: "ECL provisions made, adequacy uncertain", complianceStatus: "Partial" },
  { bankShortName: "Shahba", parentAffiliation: "Banque de l'Habitat (Lebanon)", provisioningStatus: "Only 18.58% provisioned vs 30% CBS requirement", complianceStatus: "Non-Compliant" },
];

export const dataGaps: DataGap[] = [
  { metric: "Capital Adequacy Ratio (CAR)", status: "Partial", description: "Risk-weighted capital ratio disclosed by 4 banks (CHB, BSO, NIB, Wataniya). Remaining 14 banks do not disclose.", baselReference: "Basel III Pillar 1 - Min 8% (10.5% with buffers)" },
  { metric: "Non-Performing Loans (NPL) Ratio", status: "Partial", description: "Extracted from IFRS 9 Stage 3 disclosures for 11 of 18 banks. 7 banks do not disclose sufficient staging data.", baselReference: "Basel III Pillar 3 Disclosure" },
  { metric: "Liquidity Coverage Ratio (LCR)", status: "Missing", description: "High-quality liquid assets vs net cash outflows not disclosed", baselReference: "Basel III LCR >= 100%" },
  { metric: "Net Stable Funding Ratio (NSFR)", status: "Missing", description: "Available stable funding vs required stable funding not disclosed", baselReference: "Basel III NSFR >= 100%" },
  { metric: "Leverage Ratio", status: "Missing", description: "Tier 1 capital vs total exposure not disclosed", baselReference: "Basel III >= 3%" },
  { metric: "Off-Balance Sheet Exposures", status: "Partial", description: "Limited disclosure in some bank reports", baselReference: "Basel III Credit Risk Framework" },
  { metric: "Interest Rate Risk in Banking Book", status: "Missing", description: "IRRBB measures not publicly disclosed", baselReference: "Basel III IRRBB Standard" },
];
