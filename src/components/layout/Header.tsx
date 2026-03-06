import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Sector Overview",
    description: "Aggregate performance and key supervisory indicators across all 18 banks",
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
  "/analytics": {
    title: "Analytics",
    description: "Advanced charts, distributions, and sector concentration analysis",
  },
  "/profiles": {
    title: "Bank Profiles",
    description: "Detailed individual bank analysis with full metric breakdowns",
  },
};

export function Header() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{page.title}</h2>
        <p className="text-xs text-slate-500">{page.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
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
