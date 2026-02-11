import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PHASES, riskLabel } from "../data/phases";
import { SCALE_PROFILES } from "../data/scaleProfiles";
import { COST_CATEGORIES } from "../data/costCategories";
import { BENCHMARKS } from "../data/benchmarks";

const NAVY = [27, 42, 74];
const MID_BLUE = [58, 91, 160];
const DARK_GREY = [64, 64, 64];
const WHITE = [255, 255, 255];

export function generateTextReport({
  inquiryName, consultDate, overallCommentary, responses, notes,
  phaseCommentary, phaseStats, gapAnalysis, totalAnswered, totalQuestions,
  selectedScale, customBudget, customDuration, planningNotes,
}) {
  let text = "INQUIRY CONSULTING ASSESSMENT\n";
  text += `Inquiry: ${inquiryName || "[Not specified]"}\nDate: ${consultDate}\n\n`;

  if (overallCommentary && overallCommentary.trim()) {
    text += `OVERALL ASSESSMENT\n${"─".repeat(60)}\n${overallCommentary.trim()}\n\n`;
  }

  if (selectedScale) {
    const sp = SCALE_PROFILES[selectedScale];
    text += `PLANNING & BENCHMARKING\n${"─".repeat(60)}\n`;
    text += `Scale classification: ${sp.label}\n`;
    text += `Typical cost range: ${sp.costRange}\n`;
    text += `Typical duration: ${sp.durationRange}\n`;
    if (customBudget) text += `Working budget estimate: \u00A3${customBudget}m\n`;
    if (customDuration) text += `Working duration estimate: ${customDuration} months\n`;

    const budgetNum = parseFloat(customBudget) || sp.avgCost;
    text += "Indicative cost breakdown:\n";
    COST_CATEGORIES.forEach((cat) => {
      const pctKey = "pct" + selectedScale.charAt(0).toUpperCase() + selectedScale.slice(1);
      const pct = cat[pctKey] || 0;
      text += `  ${cat.label}: ~\u00A3${Math.round(budgetNum * pct / 100)}m (${pct}%)\n`;
    });

    for (const [key, label] of [["scaleNotes", "Scale assessment notes"], ["budgetNotes", "Budget notes"], ["timelineNotes", "Timeline notes"], ["comparatorNotes", "Comparator analysis notes"]]) {
      if (planningNotes[key] && planningNotes[key].trim()) {
        text += `${label}: ${planningNotes[key].trim()}\n`;
      }
    }

    text += "\nComparable inquiries:\n";
    const matchScale = selectedScale === "veryLarge" ? "very large" : selectedScale;
    BENCHMARKS.filter((b) => b.scale === matchScale).forEach((b) => {
      text += `  ${b.name} (${b.year}): ${b.duration}, \u00A3${b.cost}m \u2014 ${b.subject}\n`;
    });
    text += "\n";
  }

  text += `SUMMARY\nQuestions assessed: ${totalAnswered} / ${totalQuestions}\nGaps identified: ${gapAnalysis.length}\nHigh-risk gaps: ${gapAnalysis.filter((g) => g.question.risk === "high").length}\n\n`;

  text += `GAP ANALYSIS & ACTION PLAN\n${"─".repeat(60)}\n\n`;
  gapAnalysis.forEach((g, i) => {
    text += `${i + 1}. [${g.question.risk.toUpperCase()} RISK] ${g.question.text}\n`;
    text += `   Phase: ${g.phase}\n`;
    text += `   Status: ${g.response === "no" ? "NOT IN PLACE" : "PARTIALLY IN PLACE"}\n`;
    text += `   Action: ${g.question.guidance}\n`;
    if (g.note) text += `   Notes: ${g.note}\n`;
    text += "\n";
  });

  text += `\nPHASE-BY-PHASE DETAIL\n${"─".repeat(60)}\n\n`;
  PHASES.forEach((phase) => {
    const s = phaseStats[phase.id];
    text += `${phase.name}\n`;
    text += `  Assessed: ${s.answered}/${s.total} | Gaps: ${s.gaps} (${s.highRiskGaps} high-risk)\n`;
    if (phaseCommentary[phase.id] && phaseCommentary[phase.id].trim()) {
      text += `  Commentary: ${phaseCommentary[phase.id].trim()}\n`;
    }
    const phaseNotes = phase.questions.filter((q) => notes[q.id] && notes[q.id].trim());
    if (phaseNotes.length > 0) {
      phaseNotes.forEach((q) => {
        const resp = responses[q.id] || "Not assessed";
        const respLabel = resp === "yes" ? "Yes" : resp === "partial" ? "Partial" : resp === "no" ? "No" : resp === "na" ? "N/A" : "Not assessed";
        text += `  - ${q.text} [${respLabel}]: ${notes[q.id].trim()}\n`;
      });
    }
    text += "\n";
  });

  return text;
}

export function generatePDF({
  inquiryName, consultDate, overallCommentary, responses, notes,
  phaseCommentary, phaseStats, gapAnalysis, totalAnswered, totalQuestions,
  selectedScale, customBudget, customDuration, planningNotes,
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  function checkPage(needed = 30) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addTitle(text) {
    checkPage(20);
    doc.setFontSize(18);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += 10;
  }

  function addHeading(text) {
    checkPage(15);
    doc.setFontSize(13);
    doc.setTextColor(...MID_BLUE);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += 8;
  }

  function addSubheading(text) {
    checkPage(12);
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += 6;
  }

  function addBody(text) {
    doc.setFontSize(10);
    doc.setTextColor(...DARK_GREY);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    });
    y += 2;
  }

  function addLine() {
    checkPage(5);
    doc.setDrawColor(...MID_BLUE);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  }

  // Title page
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Public Inquiry", margin, 30);
  doc.text("Consulting Assessment", margin, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(inquiryName || "Unnamed Inquiry", margin, 58);
  doc.setFontSize(11);
  doc.text(consultDate, margin, 68);

  y = 95;
  doc.setTextColor(...DARK_GREY);

  // Summary stats
  addHeading("Summary");
  addBody(`Questions assessed: ${totalAnswered} / ${totalQuestions}`);
  addBody(`Gaps identified: ${gapAnalysis.length}`);
  addBody(`High-risk gaps: ${gapAnalysis.filter((g) => g.question.risk === "high").length}`);
  y += 3;

  // Overall commentary
  if (overallCommentary && overallCommentary.trim()) {
    addHeading("Overall Assessment");
    addBody(overallCommentary.trim());
    y += 3;
  }

  // Planning summary
  if (selectedScale) {
    addHeading("Planning & Benchmarking");
    const sp = SCALE_PROFILES[selectedScale];
    addBody(`Scale: ${sp.label} | Cost range: ${sp.costRange} | Duration: ${sp.durationRange}`);
    if (customBudget) addBody(`Working budget: \u00A3${customBudget}m`);
    if (customDuration) addBody(`Working duration: ${customDuration} months`);
    y += 3;
  }

  // Gap analysis
  if (gapAnalysis.length > 0) {
    addLine();
    addHeading("Gap Analysis & Action Plan");

    const tableBody = gapAnalysis.map((g, i) => [
      `${i + 1}`,
      g.question.text,
      g.phase,
      riskLabel[g.question.risk],
      g.response === "no" ? "Not in place" : "Partial",
    ]);

    doc.autoTable({
      startY: y,
      head: [["#", "Question", "Phase", "Risk", "Status"]],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3, textColor: DARK_GREY },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 22 },
      },
      didDrawPage: () => { y = margin; },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Detailed gap actions
  if (gapAnalysis.length > 0) {
    checkPage(20);
    addHeading("Recommended Actions");
    gapAnalysis.forEach((g, i) => {
      checkPage(25);
      addSubheading(`${i + 1}. ${g.question.text}`);
      addBody(`Phase: ${g.phase} | Risk: ${riskLabel[g.question.risk]} | Status: ${g.response === "no" ? "Not in place" : "Partial"}`);
      addBody(`Action: ${g.question.guidance}`);
      if (g.note) addBody(`Notes: ${g.note}`);
      y += 2;
    });
  }

  // Phase summaries
  addLine();
  addHeading("Phase-by-Phase Summary");
  PHASES.forEach((phase) => {
    const s = phaseStats[phase.id];
    checkPage(20);
    addSubheading(`${phase.name}`);
    addBody(`Assessed: ${s.answered}/${s.total} | Gaps: ${s.gaps} (${s.highRiskGaps} high-risk)`);
    if (phaseCommentary[phase.id] && phaseCommentary[phase.id].trim()) {
      addBody(`Commentary: ${phaseCommentary[phase.id].trim()}`);
    }
    y += 2;
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${inquiryName || "Assessment"} | ${consultDate} | Page ${i} of ${pageCount}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`${inquiryName || "assessment"}-${consultDate}.pdf`);
}
