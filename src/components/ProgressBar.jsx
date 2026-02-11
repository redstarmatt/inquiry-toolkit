export default function ProgressBar({ totalAnswered, totalQuestions, gapCount, highRiskCount }) {
  return (
    <div style={styles.progress}>
      <span style={styles.progressText}>{totalAnswered} / {totalQuestions} assessed</span>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(totalAnswered / totalQuestions) * 100}%` }} />
      </div>
      <span style={styles.progressText}>{gapCount} gaps found</span>
      <span style={{ ...styles.progressText, color: "#C00000", fontWeight: 600 }}>{highRiskCount} high-risk</span>
    </div>
  );
}

const styles = {
  progress: { background: "#e8ecf1", borderRadius: 16, padding: "12px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  progressBar: { flex: 1, minWidth: 200, height: 8, background: "#d0d7e2", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #3A5BA0, #70AD47)", borderRadius: 4, transition: "width 0.3s" },
  progressText: { fontSize: 13, color: "#4a5568", fontWeight: 500, whiteSpace: "nowrap" },
};
