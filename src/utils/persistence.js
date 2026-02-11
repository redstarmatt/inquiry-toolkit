import { supabase } from "../lib/supabase";

const CURRENT_KEY = "inquiry-toolkit-current";

function stateToRow(state) {
  return {
    inquiry_name: state.inquiryName || "",
    consult_date: state.consultDate || new Date().toISOString().split("T")[0],
    responses: state.responses || {},
    notes: state.notes || {},
    phase_commentary: state.phaseCommentary || {},
    overall_commentary: state.overallCommentary || "",
    selected_scale: state.selectedScale || "",
    custom_budget: state.customBudget || "",
    custom_duration: state.customDuration || "",
    planning_notes: state.planningNotes || {},
    saved_at: new Date().toISOString(),
  };
}

function rowToState(row) {
  return {
    id: row.id,
    inquiryName: row.inquiry_name,
    consultDate: row.consult_date,
    responses: row.responses || {},
    notes: row.notes || {},
    phaseCommentary: row.phase_commentary || {},
    overallCommentary: row.overall_commentary || "",
    selectedScale: row.selected_scale || "",
    customBudget: row.custom_budget || "",
    customDuration: row.custom_duration || "",
    planningNotes: row.planning_notes || {},
    savedAt: row.saved_at,
  };
}

export async function listSavedAssessments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToState);
}

export async function saveAssessment(state) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const row = stateToRow(state);

  if (state.id) {
    const { data, error } = await supabase
      .from("assessments")
      .update(row)
      .eq("id", state.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    const result = rowToState(data);
    setCurrentAssessmentId(result.id);
    return result;
  } else {
    const { data, error } = await supabase
      .from("assessments")
      .insert({ ...row, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const result = rowToState(data);
    setCurrentAssessmentId(result.id);
    return result;
  }
}

export async function loadAssessment(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return rowToState(data);
}

export async function deleteAssessment(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  const current = getCurrentAssessmentId();
  if (current === id) {
    localStorage.removeItem(CURRENT_KEY);
  }
}

export function getCurrentAssessmentId() {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentAssessmentId(id) {
  localStorage.setItem(CURRENT_KEY, id);
}

export function exportAssessmentJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.inquiryName || "assessment"}-${state.consultDate || "export"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAssessmentJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
