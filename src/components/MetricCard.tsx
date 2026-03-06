import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accent?: "blue" | "emerald" | "amber" | "red" | "purple" | "slate";
  className?: string;
  valueClassName?: string;
  compact?: boolean;
}

const accentMap = {
  blue: "border-l-blue-500",
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
  purple: "border-l-purple-500",
  slate: "border-l-slate-400",
};

const iconBgMap = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  slate: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "blue",
  className,
  valueClassName,
  compact,
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "card-surface border-l-[3px] p-3.5",
        accentMap[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="metric-label mb-1">{title}</p>
          <p className={cn(
            compact ? "text-lg font-bold" : "text-xl font-bold",
            "tabular-nums tracking-tight text-slate-900 dark:text-slate-50",
            valueClassName
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-1.5 rounded-md shrink-0", iconBgMap[accent])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <TrendIcon className={cn("h-3 w-3", trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-slate-400")} />
          <span className={cn("text-[10px] font-medium", trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-400")}>
            {trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Stable"}
          </span>
        </div>
      )}
    </div>
  );
}
