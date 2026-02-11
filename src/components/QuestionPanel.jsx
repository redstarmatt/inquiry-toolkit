import { useState } from "react";
import { RESPONSES, riskColor, riskLabel, responseColor, responseIcon } from "../data/phases";
import { generatePhaseCommentary, hasApiKey } from "../utils/ai";

export default function QuestionPanel({ phase, responses, notes, showGuidance, onResponse, onNote, onToggleGuidance, phaseCommentary, onPhaseComment, onClose, aiState }) {
  const [generatingPhase, setGeneratingPhase] = useState(false);

  const handleGeneratePhase = async () => {
    const hasKey = await hasApiKey();
    if (!hasKey) { alert("Please set your Gemini API key in Settings first."); return; }
    if (!aiState) return;
    setGeneratingPhase(true);
    try {
      const text = await generatePhaseCommentary(aiState, phase.id);
      onPhaseComment(phase.id, text);
    } catch (err) {
      alert(`AI generation failed: ${err.message}`);
    } finally {
      setGeneratingPhase(false);
    }
  };
  return (
    <div style={styles.panel}>
      <div style={headerStyle(phase.color)}>
        <h2 style={styles.headerTitle}>{phase.icon} {phase.name}</h2>
        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>

      {phase.questions.map((q) => {
        const resp = responses[q.id] || "unanswered";
        return (
          <div key={q.id} style={questionStyle(responseColor[resp])}>
            <div style={styles.qTop}>
              <p style={styles.qText}>{q.text}</p>
              <div style={styles.qMeta}>
                <span style={styles.catBadge}>{q.category}</span>
                <span style={riskBadgeStyle(riskColor[q.risk])}>{riskLabel[q.risk]}</span>
              </div>
            </div>
            <div style={styles.responseRow}>
              {["yes", "partial", "no", "na"].map((r) => (
                <button key={r} style={responseBtnStyle(resp === r, responseColor[r])} onClick={() => onResponse(q.id, r)}>
                  {responseIcon[r]} {RESPONSES[r]}
                </button>
              ))}
              <button style={styles.guidanceToggle} onClick={() => onToggleGuidance(q.id)}>
                {showGuidance[q.id] ? "Hide guidance \u25B2" : "Show guidance \u25BC"}
              </button>
            </div>
            {showGuidance[q.id] && <p style={styles.guidance}>{q.guidance}</p>}
            <input
              style={styles.noteInput}
              placeholder="Notes \u2014 observations, context, actions discussed..."
              value={notes[q.id] || ""}
              onChange={(e) => onNote(q.id, e.target.value)}
            />
          </div>
        );
      })}

      <div style={commentaryStyle(phase.color)}>
        <div style={styles.commentaryHeader}>
          <div>
            <div style={commentaryLabelStyle(phase.color)}>{"\u{1F4DD}"} Phase Commentary</div>
            <p style={styles.commentaryHint}>
              Free text assessment of this phase overall &mdash; key themes, concerns, strengths, recommendations, and anything that doesn&apos;t fit neatly into individual questions.
            </p>
          </div>
          <button
            style={styles.aiBtn}
            onClick={handleGeneratePhase}
            disabled={generatingPhase}
            title="Generate phase commentary using AI"
          >
            {generatingPhase ? "⏳ Generating..." : "✨ Generate with AI"}
          </button>
        </div>
        <textarea
          style={styles.commentaryTextarea}
          placeholder={`Your overall assessment of ${phase.name}...`}
          value={phaseCommentary[phase.id] || ""}
          onChange={(e) => onPhaseComment(phase.id, e.target.value)}
        />
      </div>
    </div>
  );
}

const headerStyle = (color) => ({
  padding: "16px 24px", background: color, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
});

const questionStyle = (bg) => ({
  padding: "16px 24px", borderBottom: "1px solid #edf0f4", background: bg, transition: "background 0.2s",
});

const riskBadgeStyle = (color) => ({
  padding: "2px 10px", borderRadius: 10, background: `${color}20`, color, fontSize: 11, fontWeight: 700,
});

const responseBtnStyle = (active, color) => ({
  padding: "5px 14px", borderRadius: 6, border: `1.5px solid ${active ? "#1B2A4A" : "#d0d7e2"}`,
  background: active ? color : "#fff", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
  transition: "all 0.15s", color: "#1a1a2e",
});

const commentaryStyle = (color) => ({
  padding: "20px 24px", borderTop: `2px solid ${color}30`, background: "#fafbfd",
});

const commentaryLabelStyle = (color) => ({
  fontSize: 13, fontWeight: 600, color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
});

const styles = {
  panel: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", overflow: "hidden", marginBottom: 24 },
  headerTitle: { fontSize: 16, fontWeight: 600, margin: 0 },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  qTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  qText: { fontSize: 14, fontWeight: 500, margin: 0, flex: 1, lineHeight: 1.5 },
  qMeta: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0 },
  catBadge: { padding: "2px 10px", borderRadius: 10, background: "#EBF1FA", color: "#3A5BA0", fontSize: 11, fontWeight: 500 },
  responseRow: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" },
  guidanceToggle: { background: "none", border: "none", color: "#3A5BA0", cursor: "pointer", fontSize: 12, fontWeight: 500, padding: "4px 0", marginTop: 4 },
  guidance: { margin: "8px 0 0 0", padding: "12px 16px", background: "#f0f4fa", borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: "#2d3748", borderLeft: "3px solid #3A5BA0" },
  noteInput: { width: "100%", marginTop: 8, padding: "8px 12px", border: "1px solid #d0d7e2", borderRadius: 6, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 32, outline: "none", background: "#fafbfd", boxSizing: "border-box" },
  commentaryHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 },
  commentaryHint: { fontSize: 12, color: "#718096", marginBottom: 0 },
  commentaryTextarea: { width: "100%", padding: "12px 16px", border: "1px solid #d0d7e2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, outline: "none", background: "#fff", lineHeight: 1.6, boxSizing: "border-box" },
  aiBtn: { padding: "6px 14px", borderRadius: 6, border: "1px solid #7C3AED", background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s", flexShrink: 0 },
};
