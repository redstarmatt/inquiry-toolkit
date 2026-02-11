import { useState } from "react";
import { SCALE_PROFILES } from "../data/scaleProfiles";
import { COST_CATEGORIES } from "../data/costCategories";
import { BENCHMARKS, SUBJECT_AREAS } from "../data/benchmarks";

export default function PlanningModule({
  selectedScale, setSelectedScale, customBudget, setCustomBudget,
  customDuration, setCustomDuration, planningNotes, setPlanningNotes,
}) {
  const [showPlanning, setShowPlanning] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBenchmarks = BENCHMARKS.filter((b) => {
    if (subjectFilter !== "all" && b.subjectArea !== subjectFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter === "statutory" && !b.type.toLowerCase().startsWith("statutory")) return false;
    if (typeFilter === "non-statutory" && !b.type.toLowerCase().startsWith("non")) return false;
    return true;
  });

  const matchScale = selectedScale === "veryLarge" ? "very large" : selectedScale;

  const setPN = (key, value) => setPlanningNotes((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} onClick={() => setShowPlanning(!showPlanning)}>
        <div>
          <h2 style={styles.headerTitle}>{"\u{1F4CA}"} Planning & Benchmarking</h2>
          <p style={styles.headerSub}>Scale classification, cost estimation, and comparator analysis</p>
        </div>
        <span style={{ fontSize: 18 }}>{showPlanning ? "\u25B2" : "\u25BC"}</span>
      </div>

      {showPlanning && (
        <div style={styles.body}>
          {/* Scale selector */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Inquiry Scale Classification</h3>
            <div style={styles.scaleGrid}>
              {["small", "medium", "large", "veryLarge"].map((scale) => {
                const sp = SCALE_PROFILES[scale];
                const isSelected = selectedScale === scale;
                return (
                  <div key={scale} onClick={() => setSelectedScale(scale)} style={scaleCardStyle(isSelected)}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#1B2A4A" : "#4a5568", margin: 0 }}>{sp.label}</p>
                    <p style={{ fontSize: 11, color: "#718096", margin: "4px 0 0" }}>{sp.costRange} &middot; {sp.durationRange}</p>
                    <p style={{ fontSize: 11, color: "#a0aec0", margin: "4px 0 0" }}>{sp.description}</p>
                  </div>
                );
              })}
            </div>
            <input style={styles.noteInput} placeholder="Scale assessment notes..." value={planningNotes.scaleNotes || ""} onChange={(e) => setPN("scaleNotes", e.target.value)} />
          </div>

          {/* Cost estimation */}
          {selectedScale && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={styles.sectionTitle}>Cost Estimation</h3>
              <div style={styles.costInputs}>
                <div>
                  <label style={styles.label}>Working budget estimate (&pound;m)</label>
                  <input type="number" style={styles.numInput} placeholder={String(SCALE_PROFILES[selectedScale].avgCost)} value={customBudget} onChange={(e) => setCustomBudget(e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Working duration (months)</label>
                  <input type="number" style={styles.numInput} placeholder={String(SCALE_PROFILES[selectedScale].avgMonths)} value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} />
                </div>
              </div>

              <div style={styles.breakdownBox}>
                <p style={styles.breakdownTitle}>Indicative Cost Breakdown</p>
                {COST_CATEGORIES.map((cat) => {
                  const pctKey = "pct" + selectedScale.charAt(0).toUpperCase() + selectedScale.slice(1);
                  const pct = cat[pctKey] || 0;
                  const budgetNum = parseFloat(customBudget) || SCALE_PROFILES[selectedScale].avgCost;
                  const amount = Math.round(budgetNum * pct / 100 * 10) / 10;
                  return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: "#4a5568" }}>{cat.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>&pound;{amount}m ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: "#d0d7e2", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3A5BA0, #70AD47)", borderRadius: 3 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #d0d7e2" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2A4A" }}>Total</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2A4A" }}>&pound;{parseFloat(customBudget) || SCALE_PROFILES[selectedScale].avgCost}m</span>
                </div>
              </div>
              <input style={styles.noteInput} placeholder="Budget notes..." value={planningNotes.budgetNotes || ""} onChange={(e) => setPN("budgetNotes", e.target.value)} />
            </div>
          )}

          {/* Comparator table */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Comparator Inquiries ({filteredBenchmarks.length} of {BENCHMARKS.length})</h3>
            <div style={styles.filters}>
              <select style={styles.select} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                {SUBJECT_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <select style={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All types</option>
                <option value="statutory">Statutory</option>
                <option value="non-statutory">Non-statutory</option>
              </select>
              <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    {["Inquiry", "Years", "Duration", "Cost", "Hearing Days", "Witnesses", "Docs (000s)", "CPs", "Type"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBenchmarks.map((b, i) => {
                    const isMatch = selectedScale && b.scale === matchScale;
                    return (
                      <tr key={i} style={{ background: isMatch ? "#EBF1FA" : i % 2 === 0 ? "#fafbfd" : "#fff", fontWeight: isMatch ? 600 : 400 }}>
                        <td style={styles.td}>{b.name}</td>
                        <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{b.year}</td>
                        <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{b.duration || "\u2014"}</td>
                        <td style={{ ...styles.td, fontWeight: 600, whiteSpace: "nowrap" }}>{b.cost !== null ? `\u00A3${b.cost}m` : "\u2014"}</td>
                        <td style={numTd(b.hearingDays)}>{b.hearingDays || "\u2014"}</td>
                        <td style={numTd(b.witnesses)}>{b.witnesses || "\u2014"}</td>
                        <td style={numTd(b.docs)}>{b.docs ? (b.docs >= 1 ? b.docs.toLocaleString() : "<1") : "\u2014"}</td>
                        <td style={numTd(b.cps)}>{b.cps ? b.cps.toLocaleString() : "\u2014"}</td>
                        <td style={{ ...styles.td, fontSize: 11, color: "#718096" }}>{b.type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <input style={styles.noteInput} placeholder="Comparator analysis notes..." value={planningNotes.comparatorNotes || ""} onChange={(e) => setPN("comparatorNotes", e.target.value)} />
          </div>

          {/* Timeline notes */}
          <div>
            <h3 style={styles.sectionTitle}>Timeline Planning Notes</h3>
            <textarea style={styles.textarea} placeholder="Key milestones, critical path, risks..." value={planningNotes.timelineNotes || ""} onChange={(e) => setPN("timelineNotes", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

const scaleCardStyle = (isSelected) => ({
  padding: "14px 16px", borderRadius: 10, border: `2px solid ${isSelected ? "#1B2A4A" : "#e0e5ec"}`,
  background: isSelected ? "#1B2A4A08" : "#fff", cursor: "pointer", transition: "all 0.2s",
});

const numTd = (val) => ({
  padding: "8px 12px", borderBottom: "1px solid #edf0f4", textAlign: "right", color: val ? "#1a1a2e" : "#ccc",
});

const styles = {
  wrapper: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", overflow: "hidden", marginBottom: 24 },
  header: { padding: "16px 24px", background: "linear-gradient(135deg, #2C3E6B 0%, #3A5BA0 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  headerTitle: { fontSize: 16, fontWeight: 600, margin: 0 },
  headerSub: { fontSize: 12, opacity: 0.8, margin: "4px 0 0" },
  body: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#1B2A4A", marginBottom: 12 },
  scaleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 },
  noteInput: { width: "100%", marginTop: 10, padding: "8px 12px", border: "1px solid #d0d7e2", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafbfd", boxSizing: "border-box" },
  costInputs: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 },
  label: { fontSize: 12, color: "#718096", display: "block", marginBottom: 4 },
  numInput: { padding: "8px 12px", border: "1px solid #d0d7e2", borderRadius: 6, fontSize: 14, width: 120, outline: "none" },
  breakdownBox: { background: "#f0f4fa", borderRadius: 10, padding: "16px 20px" },
  breakdownTitle: { fontSize: 13, fontWeight: 600, color: "#1B2A4A", marginBottom: 10 },
  filters: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  select: { padding: "6px 10px", borderRadius: 6, border: "1px solid #d0d7e2", fontSize: 12, background: "#fff", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  tableHeader: { background: "#1B2A4A", color: "#fff" },
  th: { padding: "10px 12px", textAlign: "left", fontWeight: 600 },
  td: { padding: "8px 12px", borderBottom: "1px solid #edf0f4" },
  textarea: { width: "100%", padding: "12px 16px", border: "1px solid #d0d7e2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, outline: "none", background: "#fafbfd", lineHeight: 1.6, boxSizing: "border-box" },
};
