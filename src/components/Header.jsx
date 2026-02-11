import { useState } from "react";
import { listSavedAssessments, deleteAssessment, exportAssessmentJSON, importAssessmentJSON } from "../utils/persistence";

export default function Header({ inquiryName, setInquiryName, consultDate, setConsultDate, onSave, onLoad, onNew }) {
  const [showSaves, setShowSaves] = useState(false);
  const saved = listSavedAssessments();

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const data = await importAssessmentJSON(file);
          onLoad(data);
        } catch {
          alert("Failed to import assessment file.");
        }
      }
    };
    input.click();
  };

  return (
    <>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.h1}>Public Inquiry Consulting Tool</h1>
          <p style={styles.subtitle}>Structured assessment and gap analysis for inquiry teams</p>
        </div>
        <div style={styles.headerInputs}>
          <input style={styles.input} placeholder="Inquiry name..." value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} />
          <input style={styles.inputSmall} type="date" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} />
          <div style={styles.btnGroup}>
            <button style={styles.headerBtn} onClick={onSave} title="Save assessment">Save</button>
            <button style={styles.headerBtn} onClick={() => setShowSaves(!showSaves)} title="Load / manage saved assessments">Load</button>
            <button style={styles.headerBtn} onClick={onNew} title="New blank assessment">New</button>
          </div>
        </div>
      </div>

      {showSaves && (
        <div style={styles.savesPanel}>
          <div style={styles.savesPanelHeader}>
            <h3 style={styles.savesTitle}>Saved Assessments</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.importBtn} onClick={handleImport}>Import JSON</button>
              <button style={styles.closeBtn} onClick={() => setShowSaves(false)}>&times;</button>
            </div>
          </div>
          {saved.length === 0 ? (
            <p style={styles.noSaves}>No saved assessments yet. Click Save to create one.</p>
          ) : (
            <div style={styles.savesList}>
              {saved.map((a) => (
                <div key={a.id} style={styles.saveItem}>
                  <div style={styles.saveInfo}>
                    <strong>{a.inquiryName || "Unnamed"}</strong>
                    <span style={styles.saveDate}>{a.consultDate} &middot; Saved {new Date(a.savedAt).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.saveActions}>
                    <button style={styles.actionBtn} onClick={() => { onLoad(a); setShowSaves(false); }}>Load</button>
                    <button style={styles.actionBtn} onClick={() => exportAssessmentJSON(a)}>Export</button>
                    <button style={{ ...styles.actionBtn, color: "#C00000" }} onClick={() => { if (confirm("Delete this assessment?")) { deleteAssessment(a.id); setShowSaves(false); setTimeout(() => setShowSaves(true), 0); } }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  header: { background: "linear-gradient(135deg, #1B2A4A 0%, #2C3E6B 100%)", color: "#fff", padding: "28px 32px", borderRadius: 12, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
  headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  h1: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" },
  subtitle: { fontSize: 13, opacity: 0.8, margin: 0 },
  headerInputs: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  input: { padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none", width: 200 },
  inputSmall: { padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none", width: 130 },
  btnGroup: { display: "flex", gap: 6 },
  headerBtn: { padding: "7px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" },
  savesPanel: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", marginBottom: 24, overflow: "hidden" },
  savesPanelHeader: { padding: "16px 24px", background: "#f0f4fa", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e0e5ec" },
  savesTitle: { fontSize: 15, fontWeight: 600, color: "#1B2A4A", margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#718096", padding: "4px 8px" },
  importBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #d0d7e2", background: "#fff", fontSize: 12, cursor: "pointer", color: "#3A5BA0", fontWeight: 500 },
  noSaves: { padding: 24, textAlign: "center", color: "#718096", fontSize: 13 },
  savesList: { maxHeight: 300, overflowY: "auto" },
  saveItem: { padding: "12px 24px", borderBottom: "1px solid #edf0f4", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
  saveInfo: { display: "flex", flexDirection: "column", gap: 2, fontSize: 13 },
  saveDate: { fontSize: 11, color: "#718096" },
  saveActions: { display: "flex", gap: 6 },
  actionBtn: { padding: "4px 12px", borderRadius: 5, border: "1px solid #d0d7e2", background: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 500, color: "#3A5BA0" },
};
