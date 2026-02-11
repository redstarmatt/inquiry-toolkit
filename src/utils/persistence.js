const STORAGE_KEY = "inquiry-toolkit-assessments";
const CURRENT_KEY = "inquiry-toolkit-current";

export function listSavedAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAssessment(state) {
  const id = state.id || crypto.randomUUID();
  const assessment = {
    ...state,
    id,
    savedAt: new Date().toISOString(),
  };

  const list = listSavedAssessments();
  const idx = list.findIndex((a) => a.id === id);
  if (idx >= 0) {
    list[idx] = assessment;
  } else {
    list.unshift(assessment);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  localStorage.setItem(CURRENT_KEY, id);
  return assessment;
}

export function loadAssessment(id) {
  const list = listSavedAssessments();
  return list.find((a) => a.id === id) || null;
}

export function deleteAssessment(id) {
  const list = listSavedAssessments().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  const current = localStorage.getItem(CURRENT_KEY);
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
      } catch (err) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
