import type { ReactNode } from 'react';
import {
  FileText,
  Database,
  Calendar,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface DataSource {
  id: number;
  bankName: string;
  shortName: string;
  type: 'Conventional' | 'Islamic' | 'Microfinance';
  period: 'YE 2024' | 'YE 2023';
  auditor: string;
  nplData: boolean;
  carData: boolean;
}

const dataSources: DataSource[] = [
  {
    id: 1,
    bankName: 'Bemo Saudi Fransi',
    shortName: 'BSFF',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Asaad Salah Sharbati',
    nplData: true,
    carData: false,
  },
  {
    id: 2,
    bankName: 'International Islamic Bank',
    shortName: 'IIB',
    type: 'Islamic',
    period: 'YE 2023',
    auditor: 'BTC International & Lutfi Al-Salamat',
    nplData: false,
    carData: false,
  },
  {
    id: 3,
    bankName: 'Al Baraka Bank',
    shortName: 'Al Baraka',
    type: 'Islamic',
    period: 'YE 2024',
    auditor: 'Dr. Muhammad Imad Al-Darkazanli',
    nplData: true,
    carData: false,
  },
  {
    id: 4,
    bankName: 'Cham Bank',
    shortName: 'CHB',
    type: 'Islamic',
    period: 'YE 2023',
    auditor: 'Not identified',
    nplData: true,
    carData: true,
  },
  {
    id: 5,
    bankName: 'Qatar National Bank Syria',
    shortName: 'QNB Syria',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Deloitte & Touche (Syria)',
    nplData: false,
    carData: false,
  },
  {
    id: 6,
    bankName: 'Bank of Syria and Overseas',
    shortName: 'BSO',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Al-Samman & Partners',
    nplData: true,
    carData: true,
  },
  {
    id: 7,
    bankName: 'IBTF (Intl Bank for Trade and Finance)',
    shortName: 'IBTF',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Al-Samman & Partners',
    nplData: true,
    carData: false,
  },
  {
    id: 8,
    bankName: 'Al Khalij Bank',
    shortName: 'Al Khalij',
    type: 'Conventional',
    period: 'YE 2023',
    auditor: 'Majd al-Din Ahmad al-Shahhan',
    nplData: false,
    carData: false,
  },
  {
    id: 9,
    bankName: 'Ahli Trust Bank',
    shortName: 'ATB',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Asaad Salah Sharbati',
    nplData: true,
    carData: false,
  },
  {
    id: 10,
    bankName: 'Fransa Bank',
    shortName: 'Fransa',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Not clearly identified',
    nplData: true,
    carData: false,
  },
  {
    id: 11,
    bankName: 'Al Arabi Bank',
    shortName: 'Al Arabi',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Not identified',
    nplData: false,
    carData: false,
  },
  {
    id: 12,
    bankName: 'Shahba Bank',
    shortName: 'Shahba',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Dr. Muhammad Imad Al-Darkazanli',
    nplData: true,
    carData: false,
  },
  {
    id: 13,
    bankName: 'Bank of Jordan - Syria',
    shortName: 'BoJ Syria',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Asaad Salah Sharbati',
    nplData: false,
    carData: false,
  },
  {
    id: 14,
    bankName: 'Bank Al Sharq',
    shortName: 'Al Sharq',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Not identified',
    nplData: true,
    carData: false,
  },
  {
    id: 15,
    bankName: 'National Islamic Bank',
    shortName: 'NIB',
    type: 'Islamic',
    period: 'YE 2024',
    auditor: 'Dr. Muhammad Imad Al-Darkazanli',
    nplData: true,
    carData: true,
  },
  {
    id: 16,
    bankName: 'Al Wataniya Bank',
    shortName: 'Al Wataniya',
    type: 'Conventional',
    period: 'YE 2024',
    auditor: 'Talal Abu-Ghazaleh & Co. (TAG)',
    nplData: true,
    carData: true,
  },
  {
    id: 17,
    bankName: 'Al Awal Bank (First Microfinance)',
    shortName: 'Al Awal MF',
    type: 'Microfinance',
    period: 'YE 2024',
    auditor: 'Not identified',
    nplData: false,
    carData: false,
  },
  {
    id: 18,
    bankName: 'Bemo Microfinance',
    shortName: 'Bemo MF',
    type: 'Microfinance',
    period: 'YE 2024',
    auditor: 'Al-Samman & Partners',
    nplData: false,
    carData: false,
  },
];

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <div className="card-surface p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DataAvailabilityBadge({ available }: { available: boolean }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
      Not Available
    </span>
  );
}

function MethodologyCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-surface p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function SourcesPage() {
  const nplBankCount = dataSources.filter((d) => d.nplData).length;

  return (
    <div className="animate-enter space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="card-surface p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-3">
          <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Data Sources
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          All data in this dashboard is derived from audited financial statements
          (IFRS-based) published by Syrian private sector banks. Financial ratios
          are calculated from reported figures. NPL ratios are extracted from IFRS
          9 Expected Credit Loss staging disclosures (Stage 3 amounts).
        </p>
      </div>

      {/* Summary Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          icon={<Database className="w-5 h-5" />}
          label="Total Reports"
          value="18"
        />
        <SummaryCard
          icon={<Calendar className="w-5 h-5" />}
          label="Reporting Period"
          value="YE 2023-2024"
        />
        <SummaryCard
          icon={<Shield className="w-5 h-5" />}
          label="Data Standard"
          value="IFRS / IAS"
        />
        <SummaryCard
          icon={<FileText className="w-5 h-5" />}
          label="NPL Coverage"
          value={`${nplBankCount} of 18 banks`}
        />
      </div>

      {/* Data Sources Table */}
      <div className="card-surface rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  #
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bank Name
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Short Name
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Type
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Period
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Auditor
                </th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  NPL Data
                </th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  CAR Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dataSources.map((source) => (
                <tr
                  key={source.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-3 sm:px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {source.id}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-50">
                    {source.bankName}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {source.shortName}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {source.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {source.period}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {source.auditor}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <DataAvailabilityBadge available={source.nplData} />
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <DataAvailabilityBadge available={source.carData} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Notes */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          Methodology Notes
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MethodologyCard
            title="NPL Ratio"
            description="Derived from IFRS 9 Stage 3 (credit-impaired) amounts as a percentage of total credit facilities. Banks that do not disclose sufficient ECL staging data are marked as unavailable."
          />
          <MethodologyCard
            title="Capital Adequacy Ratio (CAR)"
            description="Reported directly by 4 banks in their notes to the financial statements. Remaining banks do not disclose risk-weighted assets required for CAR calculation."
          />
          <MethodologyCard
            title="Prudential Ratios"
            description="ROA, ROE, Equity/Assets, Cost-to-Income, Loans-to-Deposits, and Cash/Assets are computed from published balance sheet and income statement figures."
          />
          <MethodologyCard
            title="Risk Rating"
            description="Assigned based on composite assessment of audit opinion, capital adequacy, NPL levels, Lebanese exposure, and profitability metrics."
          />
        </div>
      </div>

      {/* Limitations Callout */}
      <div className="card-surface p-4 sm:p-6 rounded-lg border-l-4 border-l-amber-500 dark:border-l-amber-400 border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3 sm:gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">
              Limitations
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed">
              This dashboard relies exclusively on published financial statements.
              Key Basel III metrics (LCR, NSFR, Leverage Ratio) are not available
              without access to regulatory reporting systems. NPL and CAR data are
              only available for a subset of banks. Risk ratings are analytical
              assessments, not official CBS classifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
