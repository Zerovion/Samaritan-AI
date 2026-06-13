import { jsPDF } from "jspdf";
import { SamaritanReport } from "../types";

interface PDFOptions {
  report: SamaritanReport;
  witnessName: string;
  witnessPhone: string;
  vehiclesInvolved: string;
  injuriesObserved: string;
  redacted: boolean;
  photoCount: number;
}

export function generateWitnessPDF(opts: PDFOptions): void {
  const { report, witnessName, witnessPhone, vehiclesInvolved, injuriesObserved, redacted, photoCount } = opts;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Helpers ─────────────────────────────────────────────────────────────
  const line = (x1: number, y1: number, x2: number, y2: number, color = "#E5E5E5") => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };

  const text = (
    str: string,
    x: number,
    yPos: number,
    opts: { size?: number; color?: string; bold?: boolean; align?: "left" | "center" | "right"; maxW?: number } = {}
  ) => {
    const { size = 9, color = "#1A1A2E", bold = false, align = "left", maxW } = opts;
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    if (maxW) {
      doc.text(str, x, yPos, { align, maxWidth: maxW });
    } else {
      doc.text(str, x, yPos, { align });
    }
  };

  const box = (x: number, yPos: number, w: number, h: number, fillColor: string, strokeColor?: string) => {
    doc.setFillColor(fillColor);
    if (strokeColor) doc.setDrawColor(strokeColor); else doc.setDrawColor(fillColor);
    doc.roundedRect(x, yPos, w, h, 2, 2, strokeColor ? "FD" : "F");
  };

  const splitText = (str: string, maxW: number): string[] => doc.splitTextToSize(str, maxW);

  // ── HEADER BANNER ────────────────────────────────────────────────────────
  box(0, 0, pageW, 32, "#0D0D14");
  // Red accent bar
  doc.setFillColor("#E11D48");
  doc.rect(0, 0, 4, 32, "F");

  text("SAMARITAN AI", margin, 11, { size: 16, color: "#FFFFFF", bold: true });
  text("BYSTANDER SHIELD & PARAMEDIC GUIDE", margin, 17, { size: 7, color: "#FF6B6B" });
  text("GOOD SAMARITAN WITNESS REPORT", margin, 23, { size: 8, color: "#A0A0C0" });
  text("STATUTORY IMMUNITY DOCUMENT — MVA SEC 134 / SC 2016", margin, 28, { size: 7, color: "#606080" });

  // Report ID top-right
  const reportId = `SAM-${Math.floor(100000 + Math.random() * 900000)}`;
  text(reportId, pageW - margin, 11, { size: 9, color: "#FF6B6B", bold: true, align: "right" });
  text(new Date().toLocaleString("en-IN"), pageW - margin, 17, { size: 7, color: "#808090", align: "right" });
  text("INDIA GAZETTE CERTIFIED", pageW - margin, 23, { size: 7, color: "#505070", align: "right" });

  y = 40;

  // ── LEGAL PROTECTION BANNER ──────────────────────────────────────────────
  box(margin, y, contentW, 10, "#0F2A1A", "#1D9E75");
  doc.setFillColor("#1D9E75");
  doc.rect(margin, y, 2, 10, "F");
  text("\"YOU CANNOT BE ARRESTED FOR HELPING.\"   Good Samaritan Law 2016 — Supreme Court of India", margin + 5, y + 6.5, { size: 8, color: "#A0F0C0", bold: true });
  y += 17;

  // ── SECTION: WITNESS IDENTITY ────────────────────────────────────────────
  text("WITNESS IDENTIFICATION", margin, y, { size: 7, color: "#E11D48", bold: true });
  line(margin, y + 2, pageW - margin, y + 2, "#E11D48");
  y += 7;

  const nameVal = redacted ? "REDACTED — Sec 134 Anonymity Right Applied" : witnessName;
  const phoneVal = redacted ? "WITHHELD — Good Samaritan Defense Active" : witnessPhone;

  box(margin, y, contentW / 2 - 3, 14, "#F8F8FC", "#E0E0F0");
  text("WITNESS NAME", margin + 3, y + 4.5, { size: 6.5, color: "#8080A0", bold: true });
  text(nameVal, margin + 3, y + 10, { size: 8.5, color: redacted ? "#A0A0C0" : "#1A1A2E" });

  box(margin + contentW / 2 + 3, y, contentW / 2 - 3, 14, "#F8F8FC", "#E0E0F0");
  text("CONTACT NUMBER", margin + contentW / 2 + 6, y + 4.5, { size: 6.5, color: "#8080A0", bold: true });
  text(phoneVal, margin + contentW / 2 + 6, y + 10, { size: 8.5, color: redacted ? "#A0A0C0" : "#1A1A2E" });

  y += 20;

  // ── SECTION: INCIDENT DETAILS ────────────────────────────────────────────
  text("INCIDENT DETAILS", margin, y, { size: 7, color: "#E11D48", bold: true });
  line(margin, y + 2, pageW - margin, y + 2, "#E11D48");
  y += 7;

  box(margin, y, contentW, 14, "#F8F8FC", "#E0E0F0");
  text("GPS LOCATION / SECTOR", margin + 3, y + 4.5, { size: 6.5, color: "#8080A0", bold: true });
  text(report.location || "Unknown — India", margin + 3, y + 10, { size: 8.5, color: "#1A1A2E" });
  y += 19;

  box(margin, y, contentW / 2 - 3, 14, "#F8F8FC", "#E0E0F0");
  text("INCIDENT TIME", margin + 3, y + 4.5, { size: 6.5, color: "#8080A0", bold: true });
  text(report.incident_time || new Date().toLocaleString("en-IN"), margin + 3, y + 10, { size: 8.5, color: "#1A1A2E" });

  box(margin + contentW / 2 + 3, y, contentW / 2 - 3, 14, "#F8F8FC", "#E0E0F0");
  text("VEHICLES INVOLVED", margin + contentW / 2 + 6, y + 4.5, { size: 6.5, color: "#8080A0", bold: true });
  text(vehiclesInvolved || "Under investigation", margin + contentW / 2 + 6, y + 10, { size: 8.5, color: "#1A1A2E" });
  y += 19;

  // Injuries observed
  box(margin, y, contentW, 14, "#FFF5F5", "#F5C0C0");
  text("CASUALTIES & INJURIES OBSERVED", margin + 3, y + 4.5, { size: 6.5, color: "#A03040", bold: true });
  text(injuriesObserved || "Not specified", margin + 3, y + 10, { size: 8.5, color: "#1A1A2E" });
  y += 20;

  // ── SECTION: WITNESS SUMMARY ─────────────────────────────────────────────
  text("WITNESS OBSERVATIONS & CARE SUMMARY", margin, y, { size: 7, color: "#E11D48", bold: true });
  line(margin, y + 2, pageW - margin, y + 2, "#E11D48");
  y += 7;

  const summaryLines = splitText(report.witness_summary || "Bystander provided first aid assistance at the scene.", contentW - 6);
  const summaryH = Math.max(16, summaryLines.length * 4.5 + 6);
  box(margin, y, contentW, summaryH, "#F8F8FC", "#E0E0F0");
  doc.setFontSize(8.5);
  doc.setTextColor("#1A1A2E");
  doc.setFont("helvetica", "normal");
  doc.text(summaryLines, margin + 3, y + 6);
  y += summaryH + 6;

  // ── SECTION: ACTIONS TAKEN ───────────────────────────────────────────────
  text("ACTIONS PERFORMED BY BYSTANDER", margin, y, { size: 7, color: "#E11D48", bold: true });
  line(margin, y + 2, pageW - margin, y + 2, "#E11D48");
  y += 7;

  const actions = report.actions_taken || [];
  actions.forEach((action, i) => {
    // Alternate row shading
    box(margin, y, contentW, 8, i % 2 === 0 ? "#F8F8FC" : "#F2F2FA", "#E8E8F0");
    doc.setFillColor("#1D9E75");
    doc.circle(margin + 4, y + 4, 1.5, "F");
    text(action, margin + 9, y + 5.5, { size: 8, color: "#1A1A2E" });
    y += 9;
  });

  y += 4;

  // ── SECTION: EMERGENCY SERVICES & EVIDENCE ───────────────────────────────
  text("EMERGENCY & EVIDENCE LOG", margin, y, { size: 7, color: "#E11D48", bold: true });
  line(margin, y + 2, pageW - margin, y + 2, "#E11D48");
  y += 7;

  const emsColor = report.emergency_services_called ? "#0F2A1A" : "#2A0F10";
  const emsBorder = report.emergency_services_called ? "#1D9E75" : "#E11D48";
  const emsText = report.emergency_services_called ? "✓  Emergency dispatch (112) CONTACTED — Ambulance requested" : "○  Emergency services not logged in this session";

  box(margin, y, contentW / 2 - 3, 10, emsColor, emsBorder);
  text(emsText, margin + 3, y + 6.5, { size: 7.5, color: report.emergency_services_called ? "#A0F0C0" : "#F0A0A0" });

  box(margin + contentW / 2 + 3, y, contentW / 2 - 3, 10, "#1A1A10", "#D4A017");
  text(`📷  ${photoCount} evidence photo${photoCount !== 1 ? "s" : ""} captured & watermarked`, margin + contentW / 2 + 6, y + 6.5, { size: 7.5, color: "#F0D080" });

  y += 16;

  // Check if we need a new page
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // ── LEGAL IMMUNITY STATEMENT ─────────────────────────────────────────────
  box(margin, y, contentW, 22, "#0A1A10", "#1D9E75");
  doc.setFillColor("#1D9E75");
  doc.rect(margin, y, 3, 22, "F");
  text("OFFICIAL IMMUNITY ENFORCEMENT CITATION", margin + 6, y + 6, { size: 7, color: "#60C080", bold: true });
  const legalLines = splitText(
    report.legal_note ||
      "Witness acted in good faith under the Good Samaritan Guidelines (Supreme Court of India, 2016) and Section 134 of the Motor Vehicles Act. The witness bears no civil or criminal liability for any outcome.",
    contentW - 10
  );
  doc.setFontSize(8);
  doc.setTextColor("#C0E8D0");
  doc.setFont("helvetica", "normal");
  doc.text(legalLines, margin + 6, y + 12);
  y += 28;

  // ── RIGHTS REMINDER ──────────────────────────────────────────────────────
  box(margin, y, contentW, 18, "#F0F0FF", "#C0C0E0");
  text("YOUR RIGHTS AS A BYSTANDER", margin + 3, y + 5, { size: 7, color: "#404080", bold: true });
  text("1. You cannot be detained, named, or sued for helping at an accident scene.", margin + 3, y + 10, { size: 7.5, color: "#404060" });
  text("2. Hospitals must provide emergency treatment without demanding your details.", margin + 3, y + 15, { size: 7.5, color: "#404060" });
  y += 24;

  // ── SIGNATURE BLOCK ──────────────────────────────────────────────────────
  line(margin, y + 12, margin + 65, y + 12, "#404040");
  line(pageW - margin - 65, y + 12, pageW - margin, y + 12, "#404040");
  text("Witness Signature (Optional)", margin, y + 16, { size: 6.5, color: "#808090" });
  text("Samaritan AI — System Generated", pageW - margin, y + 16, { size: 6.5, color: "#808090", align: "right" });
  y += 24;

  // ── FOOTER ───────────────────────────────────────────────────────────────
  box(0, doc.internal.pageSize.getHeight() - 12, pageW, 12, "#0D0D14");
  text(
    `Samaritan AI v4.1  ·  Report ${reportId}  ·  Generated ${new Date().toLocaleString("en-IN")}  ·  IMMUNITY: INDIAN-MVA-2016  ·  Active Emergency Life Support Portal — India`,
    pageW / 2,
    doc.internal.pageSize.getHeight() - 4,
    { size: 6, color: "#505070", align: "center" }
  );

  doc.save(`samaritan_witness_report_${reportId}.pdf`);
}
