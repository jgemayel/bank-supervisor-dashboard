import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import type { BankData, SectorAggregates } from "../types";
import {
  exportElementToPdf,
  exportDashboardReport,
} from "../lib/exportPdf";

interface ExportButtonProps {
  variant?: "element" | "report";
  elementId?: string;
  filename?: string;
  banks?: BankData[];
  sectorAggregates?: SectorAggregates;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({
  variant = "report",
  elementId,
  filename = "export.pdf",
  banks,
  sectorAggregates,
  className,
  size = "default",
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      if (variant === "element" && elementId) {
        await exportElementToPdf(elementId, filename);
      } else if (
        variant === "report" &&
        banks &&
        sectorAggregates
      ) {
        await exportDashboardReport(banks, sectorAggregates);
      } else {
        console.warn(
          "Missing required props for export variant:",
          variant
        );
        return;
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      className={className}
      size={size}
      title={
        variant === "element"
          ? "Export dashboard view to PDF"
          : "Export sector report to PDF"
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  );
}
