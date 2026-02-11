export default function PhaseCard({ phase, stats, isActive, onClick }) {
  return (
    <div style={cardStyle(phase.color, isActive)} onClick={onClick}>
      <p style={titleStyle(phase.color)}>
        <span>{phase.icon}</span> {phase.name}
      </p>
      <div style={styles.stats}>
        <span style={badge("#E2EFDA")}>{stats.answered}/{stats.total}</span>
        {stats.gaps > 0 && <span style={badge("#FCE4EC")}>{stats.gaps} gaps</span>}
        {stats.highRiskGaps > 0 && <span style={badge("#FECACA")}>{stats.highRiskGaps} high-risk</span>}
        {stats.notesCount > 0 && <span style={badge("#EBF1FA")}>{stats.notesCount} notes</span>}
        {stats.hasCommentary && <span style={badge("#FFF3E0")}>Commentary</span>}
      </div>
    </div>
  );
}

const cardStyle = (color, active) => ({
  padding: "16px 18px",
  borderRadius: 10,
  border: `2px solid ${active ? color : "#e0e5ec"}`,
  background: active ? `${color}10` : "#fff",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  flexDirection: "column",
  gap: 6,
});

const titleStyle = (color) => ({
  fontSize: 14, fontWeight: 600, color, margin: 0, display: "flex", alignItems: "center", gap: 8,
});

const badge = (bg) => ({
  padding: "2px 8px", borderRadius: 10, background: bg, fontSize: 11, fontWeight: 600,
});

const styles = {
  stats: { fontSize: 12, color: "#718096", display: "flex", gap: 8, flexWrap: "wrap" },
};
