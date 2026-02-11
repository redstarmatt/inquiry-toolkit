import { PHASES, riskColor, riskLabel } from "../data/phases";
import { generateTextReport, generatePDF } from "../utils/reportGenerator";

export default function Report({
  show, onToggle, inquiryName, consultDate, overallCommentary, responses, notes,
  phaseCommentary, phaseStats, gapAnalysis, totalAnswered, totalQuestions,
  selectedScale, customBudget, customDuration, planningNotes,
}) {
  const reportArgs = {
    inquiryName, consultDate, overallCommentary, responses, notes,
    phaseCommentary, phaseStats, gapAnalysis, totalAnswered, totalQuestions,
    selectedScale, customBudget, customDuration, planningNotes,
  };

  const copyReport = () => {
    const text = generateTextReport(reportArgs);
    navigator.clipboard?.writeText(text);
  };

  const downloadPDF = () => {
    generatePDF(reportArgs);
  };

  return (
    <>
      <button style={toggleStyle(show)} onClick={onToggle}>
        {show ? "Hide Assessment Report \u25B2" : "View Assessment Report \u25BC"}
      </button>

      {show && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Gap Analysis & Action Plan</h2>
              <p style={styles.meta}>{inquiryName || "Unnamed inquiry"} &mdash; {consultDate}</p>
            </div>
            <div style={styles.btnGroup}>
              <button style={styles.btn} onClick={copyReport}>Copy to Clipboard</button>
              <button style={styles.pdfBtn} onClick={downloadPDF}>Download PDF</button>
            </div>
          </div>

          {/* Overall commentary */}
          {overallCommentary && overallCommentary.trim() && (
            <div>
              <h3 style={styles.sectionTitle}>Overall Assessment</h3>
              <div style={styles.overall}>{overallCommentary.trim()}</div>
            </div>
          )}

          {/* Summary stats */}
          <div style={styles.statsBar}>
            <span><strong>{totalAnswered}</strong> / {totalQuestions} assessed</span>
            <span><strong>{gapAnalysis.length}</strong> gaps identified</span>
            <span style={{ color: "#C00000" }}><strong>{gapAnalysis.filter((g) => g.question.risk === "high").length}</strong> high-risk</span>
          </div>

          {/* Gap items */}
          {gapAnalysis.length === 0 ? (
            <p style={styles.empty}>No gaps identified yet. Complete the phase assessments above.</p>
          ) : (
            <div>
              <h3 style={styles.sectionTitle}>Gaps & Actions</h3>
              <p style={styles.sortNote}>Sorted by risk level (high first) then status (not in place before partial).</p>
              {gapAnalysis.map((g, i) => (
                <div key={i} style={styles.gapItem}>
                  <div style={styles.gapHeader}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.gapTitle}>{i + 1}. {g.question.text}</p>
                      <p style={styles.gapPhase}>{g.phase} &mdash; {g.question.category}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={riskBadge(riskColor[g.question.risk])}>{riskLabel[g.question.risk]} risk</span>
                      <span style={statusBadge(g.response)}>
                        {g.response === "no" ? "Not in place" : "Partial"}
                      </span>
                    </div>
                  </div>
                  <div style={styles.gapAction}>
                    <strong>Recommended action:</strong> {g.question.guidance}
                  </div>
                  {g.note && <p style={styles.gapNote}>{"\u{1F4DD}"} {g.note}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Phase summaries */}
          <h3 style={{ ...styles.sectionTitle, marginTop: 28 }}>Phase Detail</h3>
          <div style={styles.summaryGrid}>
            {PHASES.map((phase) => {
              const s = phaseStats[phase.id];
              const commentary = phaseCommentary[phase.id];
              const phaseNotes = phase.questions.filter((q) => notes[q.id] && notes[q.id].trim());
              return (
                <div key={phase.id} style={summaryCard(phase.color)}>
                  <p style={styles.cardTitle}>{phase.icon} {phase.name}</p>
                  <p style={styles.cardStat}>{s.answered}/{s.total} assessed &middot; {s.gaps} gaps &middot; {s.highRiskGaps} high-risk</p>
                  {commentary && commentary.trim() && (
                    <div style={styles.cardCommentary}>{commentary.trim()}</div>
                  )}
                  {phaseNotes.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={styles.notesLabel}>Question notes:</p>
                      {phaseNotes.map((q) => (
                        <p key={q.id} style={styles.noteItem}>
                          <strong>{q.text.substring(0, 50)}{q.text.length > 50 ? "..." : ""}</strong>
                          {" \u2014 "}{notes[q.id]}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

const toggleStyle = (show) => ({
  padding: "10px 24px", borderRadius: 8, border: "2px solid #1B2A4A",
  background: show ? "#1B2A4A" : "#fff", color: show ? "#fff" : "#1B2A4A",
  cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s",
  display: "block", margin: "0 auto 24px", width: "fit-content",
});

const riskBadge = (color) => ({
  padding: "2px 10px", borderRadius: 10, background: `${color}20`, color, fontSize: 11, fontWeight: 700,
});

const statusBadge = (response) => ({
  padding: "2px 8px", borderRadius: 10, background: response === "no" ? "#FCE4EC" : "#FFF3E0",
  fontSize: 11, fontWeight: 600,
});

const summaryCard = (color) => ({
  padding: "14px 18px", borderRadius: 10, borderLeft: `4px solid ${color}`, background: "#fafbfd",
});

const styles = {
  panel: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", padding: "24px 32px", marginBottom: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 20, fontWeight: 700, color: "#1B2A4A", margin: 0 },
  meta: { margin: "4px 0 0", fontSize: 13, color: "#718096" },
  btnGroup: { display: "flex", gap: 8 },
  btn: { padding: "8px 20px", borderRadius: 8, border: "none", background: "#1B2A4A", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  pdfBtn: { padding: "8px 20px", borderRadius: 8, border: "2px solid #1B2A4A", background: "#fff", color: "#1B2A4A", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#1B2A4A", marginBottom: 10 },
  overall: { padding: "16px 20px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #e0e5ec", marginBottom: 20, lineHeight: 1.7, fontSize: 14, color: "#2d3748", whiteSpace: "pre-wrap" },
  statsBar: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "#f0f4fa", borderRadius: 10, fontSize: 14 },
  empty: { textAlign: "center", color: "#718096", padding: 40 },
  sortNote: { fontSize: 13, color: "#718096", marginBottom: 16 },
  gapItem: { padding: "14px 20px", borderRadius: 8, border: "1px solid #e8ecf1", marginBottom: 10, background: "#fafbfd" },
  gapHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  gapTitle: { fontSize: 14, fontWeight: 600, margin: 0, flex: 1 },
  gapPhase: { fontSize: 11, color: "#718096", marginTop: 4 },
  gapAction: { fontSize: 13, color: "#2d3748", lineHeight: 1.6, marginTop: 8, padding: "10px 14px", background: "#f0f4fa", borderRadius: 6, borderLeft: "3px solid #3A5BA0" },
  gapNote: { fontSize: 12, color: "#4a5568", marginTop: 6, fontStyle: "italic", padding: "6px 10px", background: "#FFF8E7", borderRadius: 4, borderLeft: "3px solid #BF8F00" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginTop: 20 },
  cardTitle: { fontSize: 13, fontWeight: 600, margin: "0 0 6px 0" },
  cardStat: { fontSize: 12, color: "#718096" },
  cardCommentary: { fontSize: 12, color: "#2d3748", marginTop: 8, padding: "8px 12px", background: "#f0f4fa", borderRadius: 6, lineHeight: 1.5, whiteSpace: "pre-wrap" },
  notesLabel: { fontSize: 11, fontWeight: 600, color: "#718096", marginBottom: 4 },
  noteItem: { fontSize: 11, color: "#4a5568", marginBottom: 3, paddingLeft: 8, borderLeft: "2px solid #d0d7e2" },
};
