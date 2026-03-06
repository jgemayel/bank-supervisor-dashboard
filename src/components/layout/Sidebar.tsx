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
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ThemeToggle";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/executive", icon: FileText, label: "Executive Brief" },
  { to: "/banks", icon: Building2, label: "Banks" },
  { to: "/prudential", icon: ShieldCheck, label: "Prudential" },
  { to: "/risk", icon: AlertTriangle, label: "Risk & Audit" },
  { to: "/stress", icon: Activity, label: "Stress Testing" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/compare", icon: GitCompareArrows, label: "Compare" },
  { to: "/profiles", icon: UserCircle, label: "Profiles" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-slate-900 dark:bg-slate-950 text-white flex flex-col transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-6 w-6 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight truncate">
                Bank Supervisor
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight truncate">
                CBS Supervisory Dashboard
              </p>
            </div>
          </div>
        )}
        {collapsed && <ShieldCheck className="h-6 w-6 text-blue-400 mx-auto" />}
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700 space-y-1">
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <ThemeToggle />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
