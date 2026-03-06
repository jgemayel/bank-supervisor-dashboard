import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { BankData, SectorAggregates } from "../types";
import { formatSYP } from "./utils";

/**
 * Exports a DOM element to a PDF file
 * @param elementId - The ID of the DOM element to capture
 * @param filename - The name of the PDF file to create
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Create PDF in landscape A4 format
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions to fit page width
    const imgWidth = pageWidth - 10; // 5mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 5; // 5mm top margin

    // Add image(s) to PDF, creating new pages if needed
    pdf.addImage(imgData, "PNG", 5, yPosition, imgWidth, imgHeight);

    // Handle multiple pages if content is taller than one page
    let remainingHeight = imgHeight;
    while (remainingHeight > pageHeight - 10) {
      remainingHeight -= pageHeight;
      pdf.addPage();
      yPosition -= pageHeight;
      pdf.addImage(
        imgData,
        "PNG",
        5,
        yPosition,
        imgWidth,
        imgHeight
      );
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
}

/**
 * Generates a structured PDF report from bank data
 * @param banks - Array of bank data
 * @param sectorAggregates - Sector-wide aggregate data
 */
export async function exportDashboardReport(
  banks: BankData[],
  sectorAggregates: SectorAggregates
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text and track position
    const addText = (
      text: string,
      fontSize: number,
      fontStyle: "normal" | "bold" = "normal",
      color: number[] = [0, 0, 0]
    ): number => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.setFont("helvetica", fontStyle);
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPosition);
      return lines.length * (fontSize / 2.5); // Approximate line height
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (spaceNeeded: number): void => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Title and Date
    yPosition += addText(
      "CBS Bank Supervisor - Sector Report",
      16,
      "bold",
      [33, 33, 33]
    );
    yPosition += 3;
    yPosition += addText(
      `Report Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      10,
      "normal",
      [100, 100, 100]
    );
    yPosition += 8;

    // Section 1: Sector Summary
    checkPageBreak(40);
    yPosition += addText("Sector Summary", 12, "bold", [33, 33, 33]);
    yPosition += 4;

    const sectorSummaryData = [
      ["Total Banks", sectorAggregates.totalBanks.toString()],
      ["Conventional Banks", sectorAggregates.conventional.toString()],
      ["Islamic Banks", sectorAggregates.islamic.toString()],
      ["Microfinance Banks", sectorAggregates.microfinance.toString()],
      ["Total Assets", formatSYP(sectorAggregates.totalAssets)],
      ["Total Equity", formatSYP(sectorAggregates.totalEquity)],
      ["Total Deposits", formatSYP(sectorAggregates.totalDeposits)],
      ["Total Credit", formatSYP(sectorAggregates.totalCredit)],
      ["Total Net Profit", formatSYP(sectorAggregates.totalNetProfit)],
      ["Weighted Avg ROA", `${sectorAggregates.wtdAvgROA.toFixed(2)}%`],
      ["Weighted Avg ROE", `${sectorAggregates.wtdAvgROE.toFixed(2)}%`],
      [
        "Weighted Avg Equity/Assets",
        `${sectorAggregates.wtdAvgEquityToAssets.toFixed(2)}%`,
      ],
    ];

    // Create simple table for sector summary
    const colWidth = contentWidth / 2;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    sectorSummaryData.forEach((row) => {
      if (yPosition + 5 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(100, 100, 100);
      pdf.text(row[0], margin, yPosition);
      pdf.setTextColor(33, 33, 33);
      pdf.text(row[1], margin + colWidth, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Section 2: Audit Summary
    checkPageBreak(25);
    yPosition += addText("Audit Opinion Summary", 12, "bold", [33, 33, 33]);
    yPosition += 4;

    const auditSummary = [
      ["Clean Opinions", sectorAggregates.cleanOpinions.toString()],
      ["Qualified Opinions", sectorAggregates.qualifiedOpinions.toString()],
      [
        "Emphasis of Matter",
        sectorAggregates.emphasisOfMatter.toString(),
      ],
    ];

    auditSummary.forEach((row) => {
      if (yPosition + 5 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(100, 100, 100);
      pdf.text(row[0], margin, yPosition);
      pdf.setTextColor(33, 33, 33);
      pdf.text(row[1], margin + colWidth, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Section 3: Risk & Exposure Summary
    checkPageBreak(20);
    yPosition += addText("Risk & Exposure Summary", 12, "bold", [33, 33, 33]);
    yPosition += 4;

    const riskSummary = [
      ["Banks with Lebanese Exposure", sectorAggregates.lebaneseExposed.toString()],
      ["Top 5 Concentration", `${sectorAggregates.top5Concentration.toFixed(1)}%`],
    ];

    riskSummary.forEach((row) => {
      if (yPosition + 5 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(100, 100, 100);
      pdf.text(row[0], margin, yPosition);
      pdf.setTextColor(33, 33, 33);
      pdf.text(row[1], margin + colWidth, yPosition);
      yPosition += 5;
    });

    yPosition += 8;

    // Section 4: Bank-by-Bank Key Metrics
    checkPageBreak(30);
    yPosition += addText("Bank-by-Bank Key Metrics", 12, "bold", [33, 33, 33]);
    yPosition += 4;

    // Table headers
    const tableMargin = margin;
    const col1Width = 25;
    const col2Width = 20;
    const col3Width = 20;
    const col4Width = 20;
    const col5Width = contentWidth - col1Width - col2Width - col3Width - col4Width;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(51, 51, 51);

    const headerY = yPosition;
    pdf.rect(tableMargin, headerY - 3, col1Width, 5, "F");
    pdf.rect(tableMargin + col1Width, headerY - 3, col2Width, 5, "F");
    pdf.rect(
      tableMargin + col1Width + col2Width,
      headerY - 3,
      col3Width,
      5,
      "F"
    );
    pdf.rect(
      tableMargin + col1Width + col2Width + col3Width,
      headerY - 3,
      col4Width,
      5,
      "F"
    );
    pdf.rect(
      tableMargin + col1Width + col2Width + col3Width + col4Width,
      headerY - 3,
      col5Width,
      5,
      "F"
    );

    pdf.text("Bank", tableMargin + 2, headerY);
    pdf.text("Type", tableMargin + col1Width + 2, headerY);
    pdf.text("ROA (%)", tableMargin + col1Width + col2Width + 2, headerY);
    pdf.text("ROE (%)", tableMargin + col1Width + col2Width + col3Width + 2, headerY);
    pdf.text("Risk", tableMargin + col1Width + col2Width + col3Width + col4Width + 2, headerY);

    yPosition += 7;

    // Table rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(33, 33, 33);

    banks.forEach((bank, index) => {
      if (yPosition + 4 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(tableMargin, yPosition - 3, contentWidth, 4, "F");
      }

      pdf.text(
        bank.shortName.substring(0, 15),
        tableMargin + 2,
        yPosition
      );
      pdf.text(
        bank.type.substring(0, 12),
        tableMargin + col1Width + 2,
        yPosition
      );
      pdf.text(
        bank.roa.toFixed(2),
        tableMargin + col1Width + col2Width + 2,
        yPosition
      );
      pdf.text(
        bank.roe.toFixed(2),
        tableMargin + col1Width + col2Width + col3Width + 2,
        yPosition
      );
      pdf.text(
        bank.riskRating,
        tableMargin + col1Width + col2Width + col3Width + col4Width + 2,
        yPosition
      );

      yPosition += 4;
    });

    yPosition += 5;

    // Footer
    checkPageBreak(10);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      "This report was automatically generated from the CBS Bank Supervisor Dashboard",
      margin,
      pageHeight - 5
    );

    pdf.save("CBS_Bank_Supervisor_Report.pdf");
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
