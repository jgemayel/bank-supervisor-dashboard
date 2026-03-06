import { useLocation } from "react-router-dom";
import { Calendar, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { exportDashboardReport } from "../../lib/exportPdf";
import { banks, sectorAggregates } from "../../data/banks";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Sector Overview",
    description: "Aggregate performance and key supervisory indicators across all 18 banks",
  },
  "/executive": {
    title: "Executive Brief",
    description: "Auto-generated sector health briefing with CAMELS ratings and early warnings",
  },
  "/banks": {
    title: "Bank Comparison",
    description: "Side-by-side comparison of financial metrics with filtering and sorting",
  },
  "/prudential": {
    title: "Prudential Standards",
    description: "Basel III benchmarks, CBS requirements, and international best practices",
  },
  "/risk": {
    title: "Risk & Audit",
    description: "Audit opinions, risk assessments, Lebanese exposure analysis, and data gaps",
  },
  "/stress": {
    title: "Stress Testing",
    description: "Sensitivity analysis for Lebanese exposure, interest rates, and credit quality",
  },
  "/analytics": {
    title: "Analytics",
    description: "Advanced charts, distributions, and sector concentration analysis",
  },
  "/compare": {
    title: "Peer Comparison",
    description: "Side-by-side benchmarking of 2-3 selected banks across all metrics",
  },
  "/profiles": {
    title: "Bank Profiles",
    description: "Detailed individual bank analysis with full metric breakdowns",
  },
};

export function Header() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles["/"];
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDashboardReport(banks, sectorAggregates);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-slate-900 dark:border-slate-700 flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{page.title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{page.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          <span>{exporting ? "Exporting..." : "Export PDF"}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <Calendar className="h-3.5 w-3.5" />
          <span>Data as of YE 2024</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
          CBS
        </div>
      </div>
    </header>
  );
}
