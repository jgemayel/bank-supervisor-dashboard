import { cn, getRiskColor, getAuditColor } from "../lib/utils";

interface StatusBadgeProps {
  label: string;
  variant: "risk" | "audit" | "custom";
  className?: string;
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  const colorClass =
    variant === "risk"
      ? getRiskColor(label)
      : variant === "audit"
      ? getAuditColor(label)
      : "";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
