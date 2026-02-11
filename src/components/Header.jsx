import { useState, useEffect } from "react";
import { listSavedAssessments, deleteAssessment, exportAssessmentJSON, importAssessmentJSON } from "../utils/persistence";
import { getApiKey, setApiKey, hasApiKey } from "../utils/ai";
import { useAuth } from "../contexts/AuthContext";

export default function Header({ inquiryName, setInquiryName, consultDate, setConsultDate, onSave, onLoad, onNew }) {
  const { user, signOut } = useAuth();
  const [showSaves, setShowSaves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Load saved assessments when panel opens
  useEffect(() => {
    if (showSaves) {
      setLoadingSaved(true);
      listSavedAssessments()
        .then(setSaved)
        .catch(() => setSaved([]))
        .finally(() => setLoadingSaved(false));
    }
  }, [showSaves]);

  // Load API key when settings panel opens
  useEffect(() => {
    if (showSettings && !apiKeyLoaded) {
      getApiKey().then((key) => {
        setApiKeyInput(key);
        setApiKeyLoaded(true);
      });
    }
  }, [showSettings, apiKeyLoaded]);

  const handleSaveKey = async () => {
    setSavingKey(true);
    try {
      await setApiKey(apiKeyInput);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    } catch (err) {
      alert("Failed to save API key: " + err.message);
    } finally {
      setSavingKey(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assessment?")) return;
    try {
      await deleteAssessment(id);
      setSaved((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

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
            <button style={{ ...styles.headerBtn, fontSize: 16 }} onClick={() => setShowSettings(!showSettings)} title="Settings">⚙️</button>
          </div>
          {user && (
            <div style={styles.userSection}>
              <span style={styles.userEmail}>{user.email}</span>
              <button style={styles.signOutBtn} onClick={signOut} title="Sign out">Sign Out</button>
            </div>
          )}
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
          {loadingSaved ? (
            <p style={styles.noSaves}>Loading saved assessments...</p>
          ) : saved.length === 0 ? (
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
                    <button style={{ ...styles.actionBtn, color: "#C00000" }} onClick={() => handleDelete(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.savesPanelHeader}>
            <h3 style={styles.savesTitle}>⚙️ Settings</h3>
            <button style={styles.closeBtn} onClick={() => setShowSettings(false)}>&times;</button>
          </div>
          <div style={styles.settingsBody}>
            <div style={styles.settingsSection}>
              <label style={styles.settingsLabel}>Gemini API Key</label>
              <p style={styles.settingsHint}>Required for AI-generated assessments and commentary. Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#3A5BA0" }}>Google AI Studio</a>.</p>
              <div style={styles.keyRow}>
                <input
                  style={styles.keyInput}
                  type="password"
                  placeholder={apiKeyLoaded ? "Enter your Gemini API key..." : "Loading..."}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  disabled={!apiKeyLoaded}
                />
                <button style={styles.saveKeyBtn} onClick={handleSaveKey} disabled={savingKey || !apiKeyLoaded}>
                  {savingKey ? "Saving..." : keySaved ? "✓ Saved" : "Save Key"}
                </button>
              </div>
              {apiKeyLoaded && apiKeyInput && (
                <p style={styles.keyStatus}>✅ API key configured — AI features enabled</p>
              )}
            </div>
          </div>
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
  userSection: { display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.3)" },
  userEmail: { fontSize: 12, opacity: 0.85, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  signOutBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, fontWeight: 500, cursor: "pointer" },
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
  settingsPanel: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", marginBottom: 24, overflow: "hidden" },
  settingsBody: { padding: "20px 24px" },
  settingsSection: { marginBottom: 16 },
  settingsLabel: { fontSize: 14, fontWeight: 600, color: "#1B2A4A", marginBottom: 4, display: "block" },
  settingsHint: { fontSize: 12, color: "#718096", marginBottom: 10, marginTop: 4 },
  keyRow: { display: "flex", gap: 8, alignItems: "center" },
  keyInput: { flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #d0d7e2", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafbfd" },
  saveKeyBtn: { padding: "8px 18px", borderRadius: 6, border: "none", background: "#3A5BA0", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  keyStatus: { fontSize: 12, color: "#70AD47", marginTop: 8, marginBottom: 0 },
};
