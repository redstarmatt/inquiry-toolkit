import { useState, useMemo, useCallback, useEffect } from "react";
import { PHASES } from "./data/phases";
import { saveAssessment, loadAssessment, getCurrentAssessmentId } from "./utils/persistence";
import { generateOverallAssessment, hasApiKey } from "./utils/ai";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import PhaseCard from "./components/PhaseCard";
import QuestionPanel from "./components/QuestionPanel";
import PlanningModule from "./components/PlanningModule";
import TimelineChart from "./components/TimelineChart";
import Report from "./components/Report";

function App() {
  const { user, loading: authLoading } = useAuth();

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
  const [generatingOverall, setGeneratingOverall] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Auto-load last assessment on mount (once authenticated)
  useEffect(() => {
    if (!user) { setAppLoading(false); return; }
    const currentId = getCurrentAssessmentId();
    if (currentId) {
      loadAssessment(currentId)
        .then((saved) => { if (saved) restoreState(saved); })
        .catch(() => {})
        .finally(() => setAppLoading(false));
    } else {
      setAppLoading(false);
    }
  }, [user]);

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

  const handleSave = useCallback(async () => {
    try {
      const saved = await saveAssessment(getState());
      setAssessmentId(saved.id);
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      alert("Save failed: " + err.message);
    }
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

  const handleGenerateOverall = useCallback(async () => {
    const hasKey = await hasApiKey();
    if (!hasKey) { alert("Please set your Gemini API key in Settings first."); return; }
    setGeneratingOverall(true);
    try {
      const text = await generateOverallAssessment({
        inquiryName, consultDate, responses, notes, phaseCommentary,
        gapAnalysis, phaseStats, phases: PHASES, selectedScale, customBudget, customDuration,
      });
      setOverallCommentary(text);
    } catch (err) {
      alert(`AI generation failed: ${err.message}`);
    } finally {
      setGeneratingOverall(false);
    }
  }, [inquiryName, consultDate, responses, notes, phaseCommentary, gapAnalysis, phaseStats, selectedScale, customBudget, customDuration]);

  const activePhase = PHASES.find((p) => p.id === currentPhase);

  // Show loading spinner while checking auth
  if (authLoading || (user && appLoading)) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <h2 style={styles.loadingTitle}>Public Inquiry Consulting Tool</h2>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

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
          aiState={{
            inquiryName, consultDate, responses, notes, phaseCommentary,
            gapAnalysis, phaseStats, phases: PHASES, selectedScale, customBudget, customDuration,
          }}
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
        <div style={styles.overallHeader}>
          <div>
            <div style={styles.overallLabel}>Overall Assessment</div>
            <p style={styles.overallSublabel}>Your holistic narrative assessment of the inquiry&apos;s readiness, key risks, and priority recommendations. This sits at the top of the report.</p>
          </div>
          <button
            style={styles.aiBtn}
            onClick={handleGenerateOverall}
            disabled={generatingOverall}
          >
            {generatingOverall ? "⏳ Generating..." : "✨ Generate with AI"}
          </button>
        </div>
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
  overallHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 },
  overallLabel: { fontSize: 16, fontWeight: 600, color: "#1B2A4A", marginBottom: 4 },
  overallSublabel: { fontSize: 12, color: "#718096", marginBottom: 0 },
  overallTextarea: { width: "100%", padding: "14px 18px", border: "1px solid #d0d7e2", borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: 120, outline: "none", background: "#fafbfd", lineHeight: 1.7, boxSizing: "border-box" },
  aiBtn: { padding: "8px 18px", borderRadius: 8, border: "1px solid #7C3AED", background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s", flexShrink: 0 },
  saveToast: { position: "fixed", top: 20, right: 20, background: "#70AD47", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 1000, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fb", fontFamily: "'Segoe UI', Arial, sans-serif" },
  loadingCard: { textAlign: "center", padding: 40 },
  loadingTitle: { fontSize: 22, fontWeight: 700, color: "#1B2A4A", margin: "0 0 12px" },
  loadingText: { fontSize: 14, color: "#718096" },
};

export default App;
