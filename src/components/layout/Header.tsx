import { useLocation } from "react-router-dom";
import { Download, Loader2, Clock, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { exportDashboardReport } from "../../lib/exportPdf";
import { banks, sectorAggregates } from "../../data/banks";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Command Center", subtitle: "Sector-wide supervisory monitoring" },
  "/executive": { title: "Executive Brief", subtitle: "Auto-generated supervisory assessment" },
  "/banks": { title: "Institution Data", subtitle: "Financial data for all licensed banks" },
  "/prudential": { title: "Prudential Standards", subtitle: "Basel III and CBS compliance benchmarks" },
  "/risk": { title: "Risk & Audit", subtitle: "Audit findings, exposures, and data gaps" },
  "/stress": { title: "Stress Testing", subtitle: "Scenario-based sensitivity analysis" },
  "/analytics": { title: "Sector Analytics", subtitle: "Concentration, distribution, and trends" },
  "/compare": { title: "Peer Comparison", subtitle: "Side-by-side institution benchmarking" },
  "/profiles": { title: "Bank Profiles", subtitle: "Individual institution deep dive" },
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

  const highRisk = banks.filter((b) => b.riskRating === "High").length;
  const qualified = banks.filter((b) => b.auditOpinion === "Qualified").length;

  return (
    <header className="border-b bg-white dark:bg-slate-900 dark:border-slate-700/60 shrink-0">
      <div className="flex items-center justify-between px-6 h-14">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {page.title}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {page.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick status indicators */}
          <div className="hidden lg:flex items-center gap-3 mr-3 pr-3 border-r border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {highRisk} High Risk
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {qualified} Qualified
              </span>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            <span>{exporting ? "Exporting..." : "Export"}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md">
            <Clock className="h-3 w-3" />
            <span>YE 2024</span>
          </div>
        </div>
      </div>
    </header>
  );
}
