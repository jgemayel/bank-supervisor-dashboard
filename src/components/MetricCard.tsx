import { cn, formatNumber } from "../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
  className?: string;
  valueClassName?: string;
}

const accentColorMap: Record<string, { bg: string; text: string; gradientBg: string; topBorder: string; darkGradient: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    gradientBg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20",
    topBorder: "border-t-2 border-blue-500 dark:border-blue-400",
    darkGradient: "dark:from-blue-950/40 dark:to-blue-900/20",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
    gradientBg: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20",
    topBorder: "border-t-2 border-emerald-500 dark:border-emerald-400",
    darkGradient: "dark:from-emerald-950/40 dark:to-emerald-900/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    gradientBg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20",
    topBorder: "border-t-2 border-amber-500 dark:border-amber-400",
    darkGradient: "dark:from-amber-950/40 dark:to-amber-900/20",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    gradientBg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20",
    topBorder: "border-t-2 border-red-500 dark:border-red-400",
    darkGradient: "dark:from-red-950/40 dark:to-red-900/20",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
    gradientBg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20",
    topBorder: "border-t-2 border-purple-500 dark:border-purple-400",
    darkGradient: "dark:from-purple-950/40 dark:to-purple-900/20",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-900/20",
    text: "text-slate-600 dark:text-slate-400",
    gradientBg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/20",
    topBorder: "border-t-2 border-slate-500 dark:border-slate-400",
    darkGradient: "dark:from-slate-900/30 dark:to-slate-800/20",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "blue",
  className,
  valueClassName,
}: MetricCardProps) {
  const colors = accentColorMap[accentColor] || accentColorMap.blue;
  const leftBorderColor = accentColor === "blue" ? "border-l-blue-500 dark:border-l-blue-400"
    : accentColor === "emerald" ? "border-l-emerald-500 dark:border-l-emerald-400"
    : accentColor === "amber" ? "border-l-amber-500 dark:border-l-amber-400"
    : accentColor === "red" ? "border-l-red-500 dark:border-l-red-400"
    : accentColor === "purple" ? "border-l-purple-500 dark:border-l-purple-400"
    : "border-l-slate-500 dark:border-l-slate-400";

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6",
        "border-l-4",
        leftBorderColor,
        "hover:shadow-lg dark:hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-black/30",
        "transition-all duration-300 animate-fade-in-up",
        className
      )}
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-xl", colors.topBorder)} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest letter-spacing-[0.05em]">
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold text-slate-900 dark:text-white",
            "tabular-nums",
            valueClassName
          )}>
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-300",
                trend === "up" && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
                trend === "down" && "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
                trend === "neutral" && "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              )}
            >
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "neutral" && <Minus className="h-4 w-4" />}
            </span>
          )}
          {Icon && (
            <div className={cn(
              "p-2.5 rounded-lg transition-all duration-300",
              colors.gradientBg
            )}>
              <Icon className={cn("h-5 w-5", colors.text)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
