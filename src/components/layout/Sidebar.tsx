import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  GitCompareArrows,
  Gauge,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ThemeToggle";
import { banks } from "../../data/banks";

const highRiskCount = banks.filter((b) => b.riskRating === "High").length;

const navSections = [
  {
    label: "Monitoring",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Command Center", end: true },
      { to: "/executive", icon: FileText, label: "Executive Brief" },
      { to: "/risk", icon: AlertTriangle, label: "Risk & Audit", badge: highRiskCount },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/banks", icon: Building2, label: "Institution Data" },
      { to: "/prudential", icon: Gauge, label: "Prudential" },
      { to: "/analytics", icon: BarChart3, label: "Sector Analytics" },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/stress", icon: Activity, label: "Stress Testing" },
      { to: "/compare", icon: GitCompareArrows, label: "Peer Comparison" },
      { to: "/profiles", icon: UserCircle, label: "Bank Profiles" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col transition-all duration-200 z-30 border-r",
        "bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800",
        collapsed ? "w-[52px]" : "w-56"
      )}
    >
      {/* Institutional Header */}
      <div className="px-3 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white leading-tight tracking-wide">CBS</div>
              <div className="text-[9px] text-slate-400 leading-tight mt-0.5">Bank Supervision</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {section.label}
                </span>
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-2.5 mx-1.5 px-2.5 py-[7px] rounded-md text-[12px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-600/15 text-blue-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full" />
                    )}
                    <item.icon className="h-[15px] w-[15px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {"badge" in item && (item.badge ?? 0) > 0 && (
                          <span className="ml-auto text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-2 space-y-1">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          {!collapsed && <span className="text-[9px] text-slate-500 uppercase tracking-wider">Theme</span>}
          <ThemeToggle />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors text-[11px]"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
