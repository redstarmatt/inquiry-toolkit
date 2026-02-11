import { useState, useMemo, useCallback, useEffect } from "react";
import { PHASES } from "./data/phases";
import { saveAssessment, loadAssessment, getCurrentAssessmentId } from "./utils/persistence";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import PhaseCard from "./components/PhaseCard";
import QuestionPanel from "./components/QuestionPanel";
import PlanningModule from "./components/PlanningModule";
import TimelineChart from "./components/TimelineChart";
import Report from "./components/Report";

function App() {
  const [assessmentId, setAssessmentId] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState({});
  const [showGuidance, setShowGuidance] = useState({});
  const [showReport, setShowReport] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [consultDate, setConsultDate] = useState(new Date().toISOString().split("T")[0]);
  const [phaseCommentary, setPhaseCommentary] = useState({});
  const [overallCommentary, setOverallCommentary] = useState("");
  const [selectedScale, setSelectedScale] = useState("");
  const [planningNotes, setPlanningNotes] = useState({});
  const [customBudget, setCustomBudget] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Auto-load last assessment on mount
  useEffect(() => {
    const currentId = getCurrentAssessmentId();
    if (currentId) {
      const saved = loadAssessment(currentId);
      if (saved) restoreState(saved);
    }
  }, []);

  function getState() {
    return {
      id: assessmentId, inquiryName, consultDate, responses, notes, phaseCommentary,
      overallCommentary, selectedScale, customBudget, customDuration, planningNotes,
    };
  }

  function restoreState(data) {
    setAssessmentId(data.id || null);
    setInquiryName(data.inquiryName || "");
    setConsultDate(data.consultDate || new Date().toISOString().split("T")[0]);
    setResponses(data.responses || {});
    setNotes(data.notes || {});
    setPhaseCommentary(data.phaseCommentary || {});
    setOverallCommentary(data.overallCommentary || "");
    setSelectedScale(data.selectedScale || "");
    setCustomBudget(data.customBudget || "");
    setCustomDuration(data.customDuration || "");
    setPlanningNotes(data.planningNotes || {});
    setShowGuidance({});
    setCurrentPhase(null);
    setShowReport(false);
  }

  const handleSave = useCallback(() => {
    const saved = saveAssessment(getState());
    setAssessmentId(saved.id);
    setSaveMessage("Saved!");
    setTimeout(() => setSaveMessage(""), 2000);
  }, [assessmentId, inquiryName, consultDate, responses, notes, phaseCommentary, overallCommentary, selectedScale, customBudget, customDuration, planningNotes]);

  const handleLoad = useCallback((data) => {
    restoreState(data);
  }, []);

  const handleNew = useCallback(() => {
    setAssessmentId(null);
    setInquiryName("");
    setConsultDate(new Date().toISOString().split("T")[0]);
    setResponses({});
    setNotes({});
    setPhaseCommentary({});
    setOverallCommentary("");
    setSelectedScale("");
    setCustomBudget("");
    setCustomDuration("");
    setPlanningNotes({});
    setShowGuidance({});
    setCurrentPhase(null);
    setShowReport(false);
  }, []);

  const setResponse = useCallback((qId, value) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const setNote = useCallback((qId, value) => {
    setNotes((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const toggleGuidance = useCallback((qId) => {
    setShowGuidance((prev) => ({ ...prev, [qId]: !prev[qId] }));
  }, []);

  const setPhaseComment = useCallback((phaseId, value) => {
    setPhaseCommentary((prev) => ({ ...prev, [phaseId]: value }));
  }, []);

  const phaseStats = useMemo(() => {
    const stats = {};
    PHASES.forEach((phase) => {
      const total = phase.questions.length;
      const answered = phase.questions.filter((q) => responses[q.id] && responses[q.id] !== "unanswered").length;
      const gaps = phase.questions.filter((q) => responses[q.id] === "no" || responses[q.id] === "partial").length;
      const highRiskGaps = phase.questions.filter((q) => (responses[q.id] === "no" || responses[q.id] === "partial") && q.risk === "high").length;
      const hasCommentary = !!(phaseCommentary[phase.id] && phaseCommentary[phase.id].trim());
      const notesCount = phase.questions.filter((q) => notes[q.id] && notes[q.id].trim()).length;
      stats[phase.id] = { total, answered, gaps, highRiskGaps, hasCommentary, notesCount };
    });
    return stats;
  }, [responses, phaseCommentary, notes]);

  const gapAnalysis = useMemo(() => {
    const gaps = [];
    PHASES.forEach((phase) => {
      phase.questions.forEach((q) => {
        if (responses[q.id] === "no" || responses[q.id] === "partial") {
          gaps.push({ phase: phase.name, phaseId: phase.id, phaseColor: phase.color, question: q, response: responses[q.id], note: notes[q.id] || "" });
        }
      });
    });
    gaps.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.question.risk] !== riskOrder[b.question.risk]) return riskOrder[a.question.risk] - riskOrder[b.question.risk];
      if (a.response !== b.response) return a.response === "no" ? -1 : 1;
      return 0;
    });
    return gaps;
  }, [responses, notes]);

  const totalAnswered = useMemo(() => Object.values(responses).filter((v) => v && v !== "unanswered").length, [responses]);
  const totalQuestions = useMemo(() => PHASES.reduce((sum, p) => sum + p.questions.length, 0), []);
  const highRiskGaps = useMemo(() => gapAnalysis.filter((g) => g.question.risk === "high").length, [gapAnalysis]);

  const activePhase = PHASES.find((p) => p.id === currentPhase);

  return (
    <div style={styles.app}>
      <Header
        inquiryName={inquiryName}
        setInquiryName={setInquiryName}
        consultDate={consultDate}
        setConsultDate={setConsultDate}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
      />

      {saveMessage && (
        <div style={styles.saveToast}>{saveMessage}</div>
      )}

      <ProgressBar
        totalAnswered={totalAnswered}
        totalQuestions={totalQuestions}
        gapCount={gapAnalysis.length}
        highRiskCount={highRiskGaps}
      />

      <div style={styles.phaseGrid}>
        {PHASES.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            stats={phaseStats[phase.id]}
            isActive={currentPhase === phase.id}
            onClick={() => setCurrentPhase(currentPhase === phase.id ? null : phase.id)}
          />
        ))}
      </div>

      {activePhase && (
        <QuestionPanel
          phase={activePhase}
          responses={responses}
          notes={notes}
          showGuidance={showGuidance}
          onResponse={setResponse}
          onNote={setNote}
          onToggleGuidance={toggleGuidance}
          phaseCommentary={phaseCommentary}
          onPhaseComment={setPhaseComment}
          onClose={() => setCurrentPhase(null)}
        />
      )}

      <PlanningModule
        selectedScale={selectedScale}
        setSelectedScale={setSelectedScale}
        customBudget={customBudget}
        setCustomBudget={setCustomBudget}
        customDuration={customDuration}
        setCustomDuration={setCustomDuration}
        planningNotes={planningNotes}
        setPlanningNotes={setPlanningNotes}
      />

      <TimelineChart selectedScale={selectedScale} />

      {/* Overall Assessment */}
      <div style={styles.overallSection}>
        <div style={styles.overallLabel}>Overall Assessment</div>
        <p style={styles.overallSublabel}>Your holistic narrative assessment of the inquiry&apos;s readiness, key risks, and priority recommendations. This sits at the top of the report.</p>
        <textarea
          style={styles.overallTextarea}
          placeholder="Overall consulting assessment..."
          value={overallCommentary}
          onChange={(e) => setOverallCommentary(e.target.value)}
        />
      </div>

      <Report
        show={showReport}
        onToggle={() => setShowReport(!showReport)}
        inquiryName={inquiryName}
        consultDate={consultDate}
        overallCommentary={overallCommentary}
        responses={responses}
        notes={notes}
        phaseCommentary={phaseCommentary}
        phaseStats={phaseStats}
        gapAnalysis={gapAnalysis}
        totalAnswered={totalAnswered}
        totalQuestions={totalQuestions}
        selectedScale={selectedScale}
        customBudget={customBudget}
        customDuration={customDuration}
        planningNotes={planningNotes}
      />
    </div>
  );
}

const styles = {
  app: { fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 1200, margin: "0 auto", padding: "16px 24px", background: "#f8f9fb", minHeight: "100vh", color: "#1a1a2e" },
  phaseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 24 },
  overallSection: { background: "#fff", borderRadius: 12, border: "1px solid #e0e5ec", padding: 24, marginBottom: 24 },
  overallLabel: { fontSize: 16, fontWeight: 600, color: "#1B2A4A", marginBottom: 4 },
  overallSublabel: { fontSize: 12, color: "#718096", marginBottom: 12 },
  overallTextarea: { width: "100%", padding: "14px 18px", border: "1px solid #d0d7e2", borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: 120, outline: "none", background: "#fafbfd", lineHeight: 1.7, boxSizing: "border-box" },
  saveToast: { position: "fixed", top: 20, right: 20, background: "#70AD47", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 1000, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
};

export default App;
