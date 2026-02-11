import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { BENCHMARKS } from "../data/benchmarks";
import { SCALE_PROFILES } from "../data/scaleProfiles";

export default function TimelineChart({ selectedScale }) {
  const [show, setShow] = useState(false);
  const [viewMode, setViewMode] = useState("duration"); // duration | cost | both

  const data = useMemo(() => {
    return BENCHMARKS
      .filter((b) => b.durationMonths && b.cost !== null)
      .map((b) => ({
        name: b.name.length > 25 ? b.name.substring(0, 22) + "..." : b.name,
        fullName: b.name,
        durationMonths: b.durationMonths,
        durationYears: Math.round(b.durationMonths / 12 * 10) / 10,
        cost: b.cost,
        scale: b.scale,
        subject: b.subject,
        type: b.type,
        status: b.status,
      }))
      .sort((a, b) => a.cost - b.cost);
  }, []);

  const matchScale = selectedScale === "veryLarge" ? "very large" : selectedScale;

  // Compute averages by scale for the summary panel
  const scaleStats = useMemo(() => {
    const groups = {};
    BENCHMARKS.filter((b) => b.cost !== null && b.durationMonths).forEach((b) => {
      const s = b.scale || "unknown";
      if (!groups[s]) groups[s] = { costs: [], durations: [], hearingDays: [], witnesses: [] };
      groups[s].costs.push(b.cost);
      groups[s].durations.push(b.durationMonths);
      if (b.hearingDays) groups[s].hearingDays.push(b.hearingDays);
      if (b.witnesses) groups[s].witnesses.push(b.witnesses);
    });

    return Object.entries(groups).map(([scale, data]) => {
      const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
      const min = (arr) => arr.length ? Math.min(...arr) : null;
      const max = (arr) => arr.length ? Math.max(...arr) : null;
      return {
        scale,
        label: scale === "very large" ? "Very Large" : scale.charAt(0).toUpperCase() + scale.slice(1),
        count: data.costs.length,
        avgCost: avg(data.costs),
        minCost: min(data.costs),
        maxCost: max(data.costs),
        avgDuration: avg(data.durations),
        minDuration: min(data.durations),
        maxDuration: max(data.durations),
        avgHearingDays: avg(data.hearingDays),
        avgWitnesses: avg(data.witnesses),
      };
    }).sort((a, b) => a.avgCost - b.avgCost);
  }, []);

  const scaleColor = (scale) => {
    const map = { small: "#70AD47", medium: "#3A5BA0", large: "#BF8F00", "very large": "#C00000" };
    return map[scale] || "#718096";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: "1px solid #e0e5ec", borderRadius: 8, padding: "12px 16px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.fullName}</p>
        <p>Cost: &pound;{d.cost}m</p>
        <p>Duration: {d.durationYears} years ({d.durationMonths} months)</p>
        <p>Type: {d.type}</p>
        <p style={{ color: "#718096" }}>{d.subject}</p>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} onClick={() => setShow(!show)}>
        <div>
          <h2 style={styles.headerTitle}>{"\u{1F4C8}"} Timeline & Operational Benchmarks</h2>
          <p style={styles.headerSub}>Visual comparison of inquiry costs, durations, and operational scale</p>
        </div>
        <span style={{ fontSize: 18 }}>{show ? "\u25B2" : "\u25BC"}</span>
      </div>

      {show && (
        <div style={styles.body}>
          {/* Summary stats by scale */}
          <h3 style={styles.sectionTitle}>Operational Ranges by Scale</h3>
          <div style={styles.statsGrid}>
            {scaleStats.map((s) => (
              <div key={s.scale} style={statsCardStyle(scaleColor(s.scale), matchScale === s.scale)}>
                <p style={{ fontSize: 13, fontWeight: 600, color: scaleColor(s.scale), margin: 0 }}>{s.label} ({s.count} inquiries)</p>
                <div style={styles.statRow}><span>Cost range:</span><strong>&pound;{s.minCost}m &ndash; &pound;{s.maxCost}m</strong></div>
                <div style={styles.statRow}><span>Avg cost:</span><strong>&pound;{s.avgCost}m</strong></div>
                <div style={styles.statRow}><span>Duration range:</span><strong>{Math.round(s.minDuration / 12 * 10) / 10} &ndash; {Math.round(s.maxDuration / 12 * 10) / 10} years</strong></div>
                <div style={styles.statRow}><span>Avg duration:</span><strong>{Math.round(s.avgDuration / 12 * 10) / 10} years</strong></div>
                {s.avgHearingDays && <div style={styles.statRow}><span>Avg hearing days:</span><strong>{s.avgHearingDays}</strong></div>}
                {s.avgWitnesses && <div style={styles.statRow}><span>Avg witnesses:</span><strong>{s.avgWitnesses}</strong></div>}
              </div>
            ))}
          </div>

          {/* Chart */}
          <h3 style={{ ...styles.sectionTitle, marginTop: 24 }}>Cost vs Duration</h3>
          <div style={styles.viewToggle}>
            {[["duration", "Duration"], ["cost", "Cost"], ["both", "Both"]].map(([v, label]) => (
              <button key={v} style={toggleBtnStyle(viewMode === v)} onClick={() => setViewMode(v)}>{label}</button>
            ))}
          </div>

          <div style={{ height: Math.max(400, data.length * 22) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: viewMode === "duration" ? "Months" : viewMode === "cost" ? "Cost (\u00A3m)" : "", position: "bottom", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={135} />
                <Tooltip content={<CustomTooltip />} />
                {(viewMode === "duration" || viewMode === "both") && (
                  <Bar dataKey="durationMonths" name="Duration (months)" barSize={viewMode === "both" ? 8 : 14}>
                    {data.map((d, i) => (
                      <Cell key={i} fill={matchScale === d.scale ? scaleColor(d.scale) : "#d0d7e2"} />
                    ))}
                  </Bar>
                )}
                {(viewMode === "cost" || viewMode === "both") && (
                  <Bar dataKey="cost" name="Cost (\u00A3m)" barSize={viewMode === "both" ? 8 : 14}>
                    {data.map((d, i) => (
                      <Cell key={i} fill={matchScale === d.scale ? scaleColor(d.scale) : "#a0b4cc"} />
                    ))}
                  </Bar>
                )}
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

const statsCardStyle = (color, highlighted) => ({
  padding: "14px 18px", borderRadius: 10, borderLeft: `4px solid ${color}`,
  background: highlighted ? `${color}10` : "#fafbfd",
  border: highlighted ? `2px solid ${color}` : undefined,
});

const toggleBtnStyle = (active) => ({
  padding: "5px 14px", borderRadius: 6, border: `1.5px solid ${active ? "#1B2A4A" : "#d0d7e2"}`,
  background: active ? "#1B2A4A" : "#fff", color: active ? "#fff" : "#1a1a2e",
  cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
});

const styles = {
  wrapper: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", overflow: "hidden", marginBottom: 24 },
  header: { padding: "16px 24px", background: "linear-gradient(135deg, #548235 0%, #70AD47 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  headerTitle: { fontSize: 16, fontWeight: 600, margin: 0 },
  headerSub: { fontSize: 12, opacity: 0.8, margin: "4px 0 0" },
  body: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#1B2A4A", marginBottom: 12 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 },
  statRow: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#4a5568", marginTop: 4 },
  viewToggle: { display: "flex", gap: 6, marginBottom: 16 },
};
