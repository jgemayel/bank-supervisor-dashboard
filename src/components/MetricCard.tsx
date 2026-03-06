import { cn, formatNumber } from "../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className={cn("text-2xl font-bold text-slate-900", valueClassName)}>
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "p-1 rounded-full",
                trend === "up" && "bg-emerald-50 text-emerald-600",
                trend === "down" && "bg-red-50 text-red-600",
                trend === "neutral" && "bg-slate-50 text-slate-400"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
              {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
              {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
            </span>
          )}
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
